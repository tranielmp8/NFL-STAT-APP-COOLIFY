import { and, desc, eq, gt } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { players, playerStats, teams } from '$lib/server/db/schema';

export type PlayerStats = typeof playerStats.$inferSelect;

export async function getPlayerStats(playerId: number, season: number, seasonType = 'regular') {
	const [stats] = await db
		.select()
		.from(playerStats)
		.where(
			and(
				eq(playerStats.playerId, playerId),
				eq(playerStats.season, season),
				eq(playerStats.seasonType, seasonType)
			)
		)
		.limit(1);

	return stats;
}

export async function getLatestPlayerStats(playerId: number) {
	const [stats] = await db
		.select()
		.from(playerStats)
		.where(eq(playerStats.playerId, playerId))
		.orderBy(desc(playerStats.season))
		.limit(1);

	return stats;
}

const leaderConfigs = [
	{ key: 'passing', label: 'Passing Leader', column: playerStats.passYards, suffix: 'pass yds' },
	{ key: 'rushing', label: 'Rushing Leader', column: playerStats.rushYards, suffix: 'rush yds' },
	{ key: 'receiving', label: 'Receiving Leader', column: playerStats.recYards, suffix: 'rec yds' },
	{ key: 'tackles', label: 'Tackles Leader', column: playerStats.tackles, suffix: 'tackles' },
	{ key: 'sacks', label: 'Sacks Leader', column: playerStats.sacks, suffix: 'sacks' },
	{ key: 'interceptions', label: 'INT Leader', column: playerStats.interceptions, suffix: 'INT' }
] as const;

export type TeamStatLeader = {
	key: string;
	label: string;
	suffix: string;
	value: number | string;
	player: {
		id: number;
		name: string;
		position: string;
		jersey: string | null;
		headshotUrl: string | null;
	};
};

export async function getTeamStatLeaders(
	abbreviation: string,
	season: number,
	seasonType = 'regular'
) {
	const leaders: TeamStatLeader[] = [];

	for (const config of leaderConfigs) {
		const [leader] = await db
			.select({
				value: config.column,
				player: {
					id: players.id,
					name: players.name,
					position: players.position,
					jersey: players.jersey,
					headshotUrl: players.headshotUrl
				}
			})
			.from(playerStats)
			.innerJoin(players, eq(playerStats.playerId, players.id))
			.innerJoin(teams, eq(players.teamId, teams.id))
			.where(
				and(
					eq(teams.abbreviation, abbreviation.toUpperCase()),
					eq(playerStats.season, season),
					eq(playerStats.seasonType, seasonType),
					gt(config.column, 0)
				)
			)
			.orderBy(desc(config.column))
			.limit(1);

		if (leader) {
			leaders.push({
				key: config.key,
				label: config.label,
				suffix: config.suffix,
				value: leader.value,
				player: leader.player
			});
		}
	}

	return leaders;
}
