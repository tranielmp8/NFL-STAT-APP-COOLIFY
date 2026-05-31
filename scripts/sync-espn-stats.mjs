import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { players, playerStats } from '../src/lib/server/db/schema.ts';

if (!process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL is not set');
}

const SEASON = Number(process.env.NFL_SEASON ?? 2025);
const SEASON_TYPE = Number(process.env.NFL_SEASON_TYPE ?? 2);
const LIMIT = Number(process.env.STATS_LIMIT ?? 0);
const ESPN_CORE_BASE =
	process.env.ESPN_CORE_BASE ?? 'https://sports.core.api.espn.com/v2/sports/football/leagues/nfl';

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

const roster = await db.select().from(players);
const syncPlayers = LIMIT > 0 ? roster.slice(0, LIMIT) : roster;
let synced = 0;
let skipped = 0;

function statMap(payload) {
	const map = new Map();
	for (const category of payload?.splits?.categories ?? []) {
		for (const stat of category?.stats ?? []) {
			map.set(stat.name, Number(stat.value ?? 0));
		}
	}
	return map;
}

const intStat = (stats, name) => Math.trunc(stats.get(name) ?? 0);
const numStat = (stats, name) => Number(stats.get(name) ?? 0).toFixed(1);

function normalizedStats(stats, playerId) {
	return {
		playerId,
		season: SEASON,
		seasonType: SEASON_TYPE === 3 ? 'postseason' : 'regular',
		passYards: intStat(stats, 'passingYards'),
		passTds: intStat(stats, 'passingTouchdowns'),
		interceptionsThrown: intStat(stats, 'interceptions'),
		rushYards: intStat(stats, 'rushingYards'),
		rushTds: intStat(stats, 'rushingTouchdowns'),
		receptions: intStat(stats, 'receptions'),
		recYards: intStat(stats, 'receivingYards'),
		recTds: intStat(stats, 'receivingTouchdowns'),
		tackles: intStat(stats, 'totalTackles'),
		sacks: numStat(stats, 'sacks'),
		interceptions: intStat(stats, 'interceptions'),
		forcedFumbles: intStat(stats, 'fumblesForced'),
		passDeflections: intStat(stats, 'passesDefended'),
		fgMade: intStat(stats, 'fieldGoalsMade') || intStat(stats, 'fieldGoals'),
		fgAttempted: intStat(stats, 'fieldGoalAttempts'),
		puntAvg: numStat(stats, 'grossAvgPuntYards'),
		returnTds: intStat(stats, 'returnTouchdowns'),
		gamesPlayed: intStat(stats, 'gamesPlayed'),
		updatedAt: new Date()
	};
}

for (const player of syncPlayers) {
	const url = `${ESPN_CORE_BASE}/seasons/${SEASON}/types/${SEASON_TYPE}/athletes/${player.espnId}/statistics?lang=en&region=us`;
	const response = await fetch(url);

	if (!response.ok) {
		skipped += 1;
		if (response.status !== 404) {
			console.warn(`${player.name}: ESPN returned ${response.status}`);
		}
		continue;
	}

	const payload = await response.json();
	const stats = statMap(payload);

	if (stats.size === 0) {
		skipped += 1;
		continue;
	}

	const values = normalizedStats(stats, player.id);

	await db
		.insert(playerStats)
		.values(values)
		.onConflictDoUpdate({
			target: [playerStats.playerId, playerStats.season, playerStats.seasonType],
			set: {
				passYards: values.passYards,
				passTds: values.passTds,
				interceptionsThrown: values.interceptionsThrown,
				rushYards: values.rushYards,
				rushTds: values.rushTds,
				receptions: values.receptions,
				recYards: values.recYards,
				recTds: values.recTds,
				tackles: values.tackles,
				sacks: values.sacks,
				interceptions: values.interceptions,
				forcedFumbles: values.forcedFumbles,
				passDeflections: values.passDeflections,
				fgMade: values.fgMade,
				fgAttempted: values.fgAttempted,
				puntAvg: values.puntAvg,
				returnTds: values.returnTds,
				gamesPlayed: values.gamesPlayed,
				updatedAt: values.updatedAt
			}
		});

	synced += 1;
	if (synced % 50 === 0) {
		console.log(`Synced ${synced}/${syncPlayers.length} player stat rows`);
	}

	await new Promise((resolve) => setTimeout(resolve, 120));
}

const totalStats = await client`select count(*)::int as count from player_stats`;
console.log(
	`Stats sync complete. Synced: ${synced}. Skipped: ${skipped}. Total stat rows: ${totalStats[0].count}`
);

await client.end();
