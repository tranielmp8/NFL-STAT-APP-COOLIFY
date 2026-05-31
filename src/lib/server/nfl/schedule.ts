import { and, asc, desc, eq, gte, lte, or } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { games } from '$lib/server/db/schema';

export type Game = typeof games.$inferSelect;

export async function getScheduleForTeam(abbreviation: string, season: number) {
	const abbr = abbreviation.toUpperCase();

	return db
		.select()
		.from(games)
		.where(and(eq(games.season, season), or(eq(games.homeTeam, abbr), eq(games.awayTeam, abbr))))
		.orderBy(asc(games.week), asc(games.gameTime));
}

export async function getRecentGames(season: number, limit = 8) {
	return db
		.select()
		.from(games)
		.where(and(eq(games.season, season), eq(games.status, 'closed')))
		.orderBy(desc(games.gameTime))
		.limit(limit);
}

export async function getUpcomingGames(season: number, limit = 8) {
	return db
		.select()
		.from(games)
		.where(
			and(
				eq(games.season, season),
				or(eq(games.status, 'scheduled'), eq(games.status, 'inprogress')),
				gte(games.gameTime, new Date())
			)
		)
		.orderBy(asc(games.gameTime))
		.limit(limit);
}

export async function getCompletedGamesThrough(season: number, date = new Date(), limit = 8) {
	return db
		.select()
		.from(games)
		.where(and(eq(games.season, season), eq(games.status, 'closed'), lte(games.gameTime, date)))
		.orderBy(desc(games.gameTime))
		.limit(limit);
}

export function recordForTeam(schedule: Game[], abbreviation: string) {
	const abbr = abbreviation.toUpperCase();
	let wins = 0;
	let losses = 0;
	let ties = 0;

	for (const game of schedule) {
		if (game.status !== 'closed' || game.homeScore === null || game.awayScore === null) continue;
		if (game.homeScore === game.awayScore) {
			ties += 1;
			continue;
		}

		const isHome = game.homeTeam === abbr;
		const teamScore = isHome ? game.homeScore : game.awayScore;
		const opponentScore = isHome ? game.awayScore : game.homeScore;

		if (teamScore > opponentScore) wins += 1;
		else losses += 1;
	}

	return { wins, losses, ties };
}
