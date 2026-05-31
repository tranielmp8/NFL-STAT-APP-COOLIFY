import { error } from '@sveltejs/kit';
import { ensureTeamsSeeded, getTeamByAbbreviation } from '$lib/server/nfl/teams';
import { getPlayersByTeamAbbreviation, groupRoster } from '$lib/server/nfl/players';
import { getScheduleForTeam, recordForTeam } from '$lib/server/nfl/schedule';
import { getTeamStatLeaders } from '$lib/server/nfl/stats';
import { getAppSettings } from '$lib/server/nfl/settings';

export async function load({ params }) {
	await ensureTeamsSeeded();

	const team = await getTeamByAbbreviation(params.abbr);

	if (!team) {
		error(404, 'Team not found');
	}

	const settings = await getAppSettings();
	const players = await getPlayersByTeamAbbreviation(params.abbr);
	const schedule = await getScheduleForTeam(params.abbr, settings.currentSeason);
	const statLeaders = await getTeamStatLeaders(
		params.abbr,
		settings.currentSeason,
		settings.currentSeasonType
	);

	return {
		team,
		activeSeason: settings.currentSeason,
		activeSeasonType: settings.currentSeasonType,
		roster: groupRoster(players),
		playerCount: players.length,
		schedule,
		record: recordForTeam(schedule, team.abbreviation),
		statLeaders
	};
}
