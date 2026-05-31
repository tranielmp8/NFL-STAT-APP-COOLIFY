import { spawn } from 'node:child_process';
import postgres from 'postgres';

if (!process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL is not set');
}

const seasonTypeToEspnType = {
	preseason: '1',
	regular: '2',
	postseason: '3'
};

const jobSteps = {
	teams: ['scripts/seed-teams.mjs'],
	rosters: ['scripts/sync-espn-rosters.mjs'],
	schedules: ['scripts/sync-espn-schedules.mjs'],
	stats: ['scripts/sync-espn-stats.mjs'],
	full: [
		'scripts/seed-teams.mjs',
		'scripts/sync-espn-rosters.mjs',
		'scripts/sync-espn-schedules.mjs',
		'scripts/sync-espn-stats.mjs'
	]
};

const pollMs = Number(process.env.SYNC_WORKER_POLL_MS ?? 15000);
const staleRunningMinutes = Number(process.env.SYNC_WORKER_STALE_MINUTES ?? 180);
const runOnce = process.env.SYNC_WORKER_ONCE === 'true' || process.argv.includes('--once');
const sql = postgres(process.env.DATABASE_URL);

async function recoverStaleJobs() {
	if (!Number.isFinite(staleRunningMinutes) || staleRunningMinutes <= 0) return 0;

	const jobs = await sql`
		update sync_jobs
		set status = 'failed',
			error = ${`Worker heartbeat stale for more than ${staleRunningMinutes} minutes.`},
			finished_at = now(),
			updated_at = now()
		where status = 'running'
			and updated_at < now() - (${staleRunningMinutes} || ' minutes')::interval
		returning id
	`;

	if (jobs.length > 0) {
		console.warn(`Marked ${jobs.length} stale sync job(s) as failed.`);
	}

	return jobs.length;
}

async function claimNextJob() {
	return sql.begin(async (tx) => {
		const [candidate] = await tx`
			select id
			from sync_jobs
			where status = 'queued'
			order by created_at asc
			for update skip locked
			limit 1
		`;

		if (!candidate) return null;

		const [job] = await tx`
			update sync_jobs
			set status = 'running',
				message = 'Worker claimed job.',
				started_at = now(),
				updated_at = now()
			where id = ${candidate.id}
			returning *
		`;

		return job;
	});
}

async function completeJob(id, message) {
	await sql`
		update sync_jobs
		set status = 'completed',
			message = ${message.slice(-4000)},
			finished_at = now(),
			updated_at = now()
		where id = ${id}
	`;
}

async function failJob(id, error) {
	await sql`
		update sync_jobs
		set status = 'failed',
			error = ${error.slice(-4000)},
			finished_at = now(),
			updated_at = now()
		where id = ${id}
	`;
}

async function updateJobMessage(id, message) {
	await sql`
		update sync_jobs
		set message = ${message.slice(-4000)},
			updated_at = now()
		where id = ${id}
	`;
}

function outputTail(output, maxLines = 18) {
	return output.trim().split(/\r?\n/).filter(Boolean).slice(-maxLines).join('\n');
}

function runScript(script, job) {
	return new Promise((resolve, reject) => {
		const child = spawn(process.execPath, ['--experimental-strip-types', script], {
			env: {
				...process.env,
				NFL_SEASON: String(job.season),
				NFL_SEASON_TYPE: seasonTypeToEspnType[job.season_type] ?? '2',
				NFL_SEASON_TYPE_LABEL: job.season_type
			},
			stdio: ['ignore', 'pipe', 'pipe']
		});

		let output = '';
		let updateTimer;

		const flushProgress = async () => {
			const tail = outputTail(output);
			await updateJobMessage(job.id, tail ? `Running ${script}\n\n${tail}` : `Running ${script}`);
		};

		const scheduleProgressUpdate = () => {
			clearTimeout(updateTimer);
			updateTimer = setTimeout(() => {
				flushProgress().catch((error) => {
					console.error(`Failed to update sync job progress: ${error.message}`);
				});
			}, 750);
		};

		child.stdout.on('data', (chunk) => {
			const text = chunk.toString();
			output += text;
			process.stdout.write(text);
			scheduleProgressUpdate();
		});

		child.stderr.on('data', (chunk) => {
			const text = chunk.toString();
			output += text;
			process.stderr.write(text);
			scheduleProgressUpdate();
		});

		child.on('error', reject);
		child.on('close', async (code) => {
			clearTimeout(updateTimer);
			await flushProgress();

			if (code === 0) {
				resolve(output);
				return;
			}

			reject(new Error(`${script} exited with code ${code}\n${output}`));
		});
	});
}

async function processJob(job) {
	const steps = jobSteps[job.type];
	if (!steps) throw new Error(`Unsupported sync job type: ${job.type}`);

	let output = '';

	for (const script of steps) {
		await sql`
			update sync_jobs
			set message = ${`Running ${script}`},
				updated_at = now()
			where id = ${job.id}
		`;

		output += `\n\n--- ${script} ---\n`;
		output += await runScript(script, job);
	}

	await completeJob(job.id, output || 'Sync job completed.');
}

async function tick() {
	await recoverStaleJobs();

	const job = await claimNextJob();
	if (!job) {
		console.log('No queued sync jobs.');
		return false;
	}

	console.log(`Claimed sync job #${job.id}: ${job.type} ${job.season} ${job.season_type}`);

	try {
		await processJob(job);
		console.log(`Completed sync job #${job.id}`);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		await failJob(job.id, message);
		console.error(`Failed sync job #${job.id}: ${message}`);
	}

	return true;
}

try {
	do {
		await tick();
		if (runOnce) break;
		await new Promise((resolve) => setTimeout(resolve, pollMs));
	} while (true);
} finally {
	await sql.end();
}
