import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { players, teams } from '../src/lib/server/db/schema.ts';
import { teamSeeds } from '../src/lib/server/nfl/team-data.ts';

if (!process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL is not set');
}

const ESPN_BASE =
	process.env.ESPN_BASE ?? 'https://site.api.espn.com/apis/site/v2/sports/football/nfl';

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

await db.insert(teams).values(teamSeeds).onConflictDoNothing({ target: teams.espnId });

const dbTeams = await db.select().from(teams);
const teamsByEspnId = new Map(dbTeams.map((team) => [team.espnId, team]));
let playerCount = 0;

function normalizeAthletes(payload) {
	if (Array.isArray(payload?.athletes)) {
		return payload.athletes.flatMap((group) => group?.items ?? group);
	}
	if (Array.isArray(payload?.entries)) {
		return payload.entries.flatMap((entry) => entry?.entries ?? []);
	}
	return [];
}

function readAthlete(entry) {
	return entry?.athlete ?? entry;
}

function readHeadshot(athlete) {
	if (typeof athlete?.headshot === 'string') return athlete.headshot;
	if (typeof athlete?.headshot?.href === 'string') return athlete.headshot.href;
	if (Array.isArray(athlete?.headshots)) return athlete.headshots[0]?.href ?? null;
	return null;
}

for (const seed of teamSeeds) {
	const team = teamsByEspnId.get(seed.espnId);
	if (!team) continue;

	const response = await fetch(`${ESPN_BASE}/teams/${seed.espnId}/roster`);
	if (!response.ok) {
		console.warn(`Skipping ${seed.abbreviation}: ESPN returned ${response.status}`);
		continue;
	}

	const payload = await response.json();
	const rosterEntries = normalizeAthletes(payload);

	for (const entry of rosterEntries) {
		const athlete = readAthlete(entry);
		const espnId = String(athlete?.id ?? '');
		const name = athlete?.displayName ?? athlete?.fullName ?? athlete?.name;
		const position =
			athlete?.position?.abbreviation ?? athlete?.position?.name ?? entry?.position ?? 'UNK';

		if (!espnId || !name) continue;

		await db
			.insert(players)
			.values({
				espnId,
				teamId: team.id,
				name,
				position,
				jersey: athlete?.jersey ? String(athlete.jersey) : null,
				headshotUrl: readHeadshot(athlete),
				status: athlete?.status?.name ?? athlete?.status?.type ?? 'active',
				updatedAt: new Date()
			})
			.onConflictDoUpdate({
				target: players.espnId,
				set: {
					teamId: team.id,
					name,
					position,
					jersey: athlete?.jersey ? String(athlete.jersey) : null,
					headshotUrl: readHeadshot(athlete),
					status: athlete?.status?.name ?? athlete?.status?.type ?? 'active',
					updatedAt: new Date()
				}
			});

		playerCount += 1;
	}

	console.log(`${seed.abbreviation}: synced ${rosterEntries.length} roster entries`);
	await new Promise((resolve) => setTimeout(resolve, 200));
}

const totalPlayers = await client`select count(*)::int as count from players`;
console.log(
	`Roster sync complete. Processed entries: ${playerCount}. Total players: ${totalPlayers[0].count}`
);

await client.end();
