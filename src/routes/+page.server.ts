import { getUserRole } from '$lib/server/authorization';
import { ensureTeamsSeeded, getAllTeams } from '$lib/server/nfl/teams';
import { getDataHealth } from '$lib/server/nfl/data-health';
import { getAppSettings } from '$lib/server/nfl/settings';
import { getLeagueLeaders } from '$lib/server/nfl/stats';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	await ensureTeamsSeeded();
	const settings = await getAppSettings();
	const [teams, health, passingLeaders, rushingLeaders, receivingLeaders] = await Promise.all([
		getAllTeams(),
		getDataHealth(settings.currentSeason, settings.currentSeasonType),
		getLeagueLeaders('passing', settings.currentSeason, settings.currentSeasonType, 3),
		getLeagueLeaders('rushing', settings.currentSeason, settings.currentSeasonType, 3),
		getLeagueLeaders('receiving', settings.currentSeason, settings.currentSeasonType, 3)
	]);
	const role = event.locals.user
		? await getUserRole(event.locals.user.id, event.locals.user.email)
		: 'user';

	return {
		teams,
		health,
		activeSeason: settings.currentSeason,
		activeSeasonType: settings.currentSeasonType,
		leaderPreview: {
			passing: passingLeaders.rows,
			rushing: rushingLeaders.rows,
			receiving: receivingLeaders.rows
		},
		user: event.locals.user ?? null,
		role
	};
};
