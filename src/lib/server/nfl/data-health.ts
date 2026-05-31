import { and, count, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { games, players, playerStats, teams } from '$lib/server/db/schema';

export async function getDataHealth(season: number, seasonType: string) {
	const [
		[teamCount],
		[playerCount],
		[statCount],
		[seasonStatCount],
		[gameCount],
		[seasonGameCount]
	] = await Promise.all([
		db.select({ total: count() }).from(teams),
		db.select({ total: count() }).from(players),
		db.select({ total: count() }).from(playerStats),
		db
			.select({ total: count() })
			.from(playerStats)
			.where(and(eq(playerStats.season, season), eq(playerStats.seasonType, seasonType))),
		db.select({ total: count() }).from(games),
		db.select({ total: count() }).from(games).where(eq(games.season, season))
	]);

	return {
		teams: teamCount?.total ?? 0,
		players: playerCount?.total ?? 0,
		statRows: statCount?.total ?? 0,
		activeSeasonStatRows: seasonStatCount?.total ?? 0,
		games: gameCount?.total ?? 0,
		activeSeasonGames: seasonGameCount?.total ?? 0
	};
}
