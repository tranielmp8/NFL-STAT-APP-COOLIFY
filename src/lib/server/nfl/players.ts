import { asc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { players, teams } from '$lib/server/db/schema';

export type Player = typeof players.$inferSelect;

const offense = new Set(['QB', 'RB', 'FB', 'WR', 'TE', 'C', 'G', 'OG', 'OT', 'T']);
const defense = new Set(['DT', 'DE', 'DL', 'EDGE', 'LB', 'ILB', 'OLB', 'CB', 'S', 'SS', 'FS']);
const specialTeams = new Set(['K', 'PK', 'P', 'LS']);

export type RosterGroups = {
	offense: Player[];
	defense: Player[];
	specialTeams: Player[];
	other: Player[];
};

export async function getPlayersByTeamAbbreviation(abbreviation: string) {
	return db
		.select({
			id: players.id,
			espnId: players.espnId,
			teamId: players.teamId,
			name: players.name,
			position: players.position,
			jersey: players.jersey,
			headshotUrl: players.headshotUrl,
			status: players.status,
			updatedAt: players.updatedAt
		})
		.from(players)
		.innerJoin(teams, eq(players.teamId, teams.id))
		.where(eq(teams.abbreviation, abbreviation.toUpperCase()))
		.orderBy(asc(players.position), asc(players.name));
}

export async function getPlayerById(id: number) {
	const [player] = await db.select().from(players).where(eq(players.id, id)).limit(1);
	return player;
}

export function groupRoster(players: Player[]): RosterGroups {
	const groups: RosterGroups = {
		offense: [],
		defense: [],
		specialTeams: [],
		other: []
	};

	for (const player of players) {
		if (offense.has(player.position)) {
			groups.offense.push(player);
		} else if (defense.has(player.position)) {
			groups.defense.push(player);
		} else if (specialTeams.has(player.position)) {
			groups.specialTeams.push(player);
		} else {
			groups.other.push(player);
		}
	}

	return groups;
}
