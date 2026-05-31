import { asc, count, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { teams } from '$lib/server/db/schema';
import { teamSeeds } from './team-data';

export type Team = typeof teams.$inferSelect;

export async function ensureTeamsSeeded() {
	const [{ value }] = await db.select({ value: count() }).from(teams);

	if (value > 0) return;

	for (const team of teamSeeds) {
		await db
			.insert(teams)
			.values(team)
			.onConflictDoUpdate({
				target: teams.espnId,
				set: {
					abbreviation: team.abbreviation,
					name: team.name,
					city: team.city,
					conference: team.conference,
					division: team.division,
					colorPrimary: team.colorPrimary,
					colorSecondary: team.colorSecondary,
					logoUrl: team.logoUrl,
					updatedAt: new Date()
				}
			});
	}
}

export async function getAllTeams() {
	return db
		.select()
		.from(teams)
		.orderBy(asc(teams.conference), asc(teams.division), asc(teams.city));
}

export async function getTeamByAbbreviation(abbreviation: string) {
	const [team] = await db
		.select()
		.from(teams)
		.where(eq(teams.abbreviation, abbreviation.toUpperCase()))
		.limit(1);

	return team;
}
