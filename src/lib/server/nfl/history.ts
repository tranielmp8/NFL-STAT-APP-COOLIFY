import { and, asc, count, desc, eq, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { games, playerStats } from '$lib/server/db/schema';

export type SeasonHistoryRow = {
	season: number;
	seasonType: string;
	statRows: number;
	scheduledGames: number;
};

export async function getSeasonHistory() {
	const statRows = await db
		.select({
			season: playerStats.season,
			seasonType: playerStats.seasonType,
			statRows: count()
		})
		.from(playerStats)
		.groupBy(playerStats.season, playerStats.seasonType)
		.orderBy(desc(playerStats.season), asc(playerStats.seasonType));

	const scheduleRows = await db
		.select({
			season: games.season,
			scheduledGames: count()
		})
		.from(games)
		.where(sql`${games.season} is not null`)
		.groupBy(games.season);

	const rows = new Map<string, SeasonHistoryRow>();

	for (const row of statRows) {
		rows.set(`${row.season}-${row.seasonType}`, {
			season: row.season,
			seasonType: row.seasonType,
			statRows: row.statRows,
			scheduledGames:
				scheduleRows.find((schedule) => schedule.season === row.season)?.scheduledGames ?? 0
		});
	}

	for (const row of scheduleRows) {
		if (row.season === null) continue;

		const key = `${row.season}-regular`;
		if (!rows.has(key)) {
			rows.set(key, {
				season: row.season,
				seasonType: 'regular',
				statRows: 0,
				scheduledGames: row.scheduledGames
			});
		}
	}

	return Array.from(rows.values()).sort(
		(a, b) => b.season - a.season || a.seasonType.localeCompare(b.seasonType)
	);
}

export async function hasSeasonStats(season: number, seasonType: string) {
	const [row] = await db
		.select({ total: count() })
		.from(playerStats)
		.where(and(eq(playerStats.season, season), eq(playerStats.seasonType, seasonType)))
		.limit(1);

	return (row?.total ?? 0) > 0;
}
