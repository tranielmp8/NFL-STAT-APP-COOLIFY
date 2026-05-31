import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { games, teams } from '../src/lib/server/db/schema.ts';
import { teamSeeds } from '../src/lib/server/nfl/team-data.ts';

if (!process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL is not set');
}

const SEASON = Number(process.env.NFL_SEASON ?? 2025);
const ESPN_BASE =
	process.env.ESPN_BASE ?? 'https://site.api.espn.com/apis/site/v2/sports/football/nfl';

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

await db.insert(teams).values(teamSeeds).onConflictDoNothing({ target: teams.espnId });

function competitorByHomeAway(competition, homeAway) {
	return competition?.competitors?.find((competitor) => competitor.homeAway === homeAway);
}

function scoreValue(competitor) {
	const value = competitor?.score?.value;
	if (value === undefined || value === null || Number.isNaN(Number(value))) return null;
	return Math.trunc(Number(value));
}

function statusValue(event, competition) {
	const status = competition?.status?.type ?? event?.status?.type;
	if (status?.completed) return 'closed';
	if (status?.state === 'in') return 'inprogress';
	return 'scheduled';
}

function broadcastValue(competition) {
	const broadcast = competition?.broadcasts?.[0];
	return broadcast?.media?.shortName ?? broadcast?.type?.shortName ?? null;
}

let synced = 0;

for (const team of teamSeeds) {
	const response = await fetch(`${ESPN_BASE}/teams/${team.espnId}/schedule?season=${SEASON}`);

	if (!response.ok) {
		console.warn(`${team.abbreviation}: ESPN returned ${response.status}`);
		continue;
	}

	const payload = await response.json();
	const events = Array.isArray(payload?.events) ? payload.events : [];

	for (const event of events) {
		const competition = event?.competitions?.[0];
		const home = competitorByHomeAway(competition, 'home');
		const away = competitorByHomeAway(competition, 'away');
		const homeTeam = home?.team?.abbreviation;
		const awayTeam = away?.team?.abbreviation;

		if (!event?.id || !homeTeam || !awayTeam) continue;

		const values = {
			id: String(event.id),
			homeTeam,
			awayTeam,
			homeScore: scoreValue(home),
			awayScore: scoreValue(away),
			status: statusValue(event, competition),
			gameTime: event.date ? new Date(event.date) : null,
			week: event?.week?.number ? Number(event.week.number) : null,
			season: Number(event?.season?.year ?? SEASON),
			broadcast: broadcastValue(competition),
			updatedAt: new Date()
		};

		await db
			.insert(games)
			.values(values)
			.onConflictDoUpdate({
				target: games.id,
				set: {
					homeTeam: values.homeTeam,
					awayTeam: values.awayTeam,
					homeScore: values.homeScore,
					awayScore: values.awayScore,
					status: values.status,
					gameTime: values.gameTime,
					week: values.week,
					season: values.season,
					broadcast: values.broadcast,
					updatedAt: values.updatedAt
				}
			});

		synced += 1;
	}

	console.log(`${team.abbreviation}: synced ${events.length} schedule events`);
	await new Promise((resolve) => setTimeout(resolve, 150));
}

const totalGames = await client`select count(*)::int as count from games`;
console.log(
	`Schedule sync complete. Processed events: ${synced}. Unique games: ${totalGames[0].count}`
);

await client.end();
