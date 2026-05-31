import { error } from '@sveltejs/kit';
import { ensureTeamsSeeded, getTeamByAbbreviation } from '$lib/server/nfl/teams';
import { getPlayersByTeamAbbreviation, groupRoster } from '$lib/server/nfl/players';
import { getScheduleForTeam, recordForTeam } from '$lib/server/nfl/schedule';
import { getTeamStatLeaders } from '$lib/server/nfl/stats';
import { getAppSettings } from '$lib/server/nfl/settings';

const seasonTypes = new Set(['preseason', 'regular', 'postseason']);

export async function load({ params, url }) {
	await ensureTeamsSeeded();

	const team = await getTeamByAbbreviation(params.abbr);

	if (!team) {
		error(404, 'Team not found');
	}

	const settings = await getAppSettings();
	const seasonParam = Number(url.searchParams.get('season'));
	const typeParam = url.searchParams.get('type') ?? settings.currentSeasonType;
	const activeSeason = Number.isInteger(seasonParam) ? seasonParam : settings.currentSeason;
	const activeSeasonType = seasonTypes.has(typeParam) ? typeParam : settings.currentSeasonType;
	const players = await getPlayersByTeamAbbreviation(params.abbr);
	const schedule = await getScheduleForTeam(params.abbr, activeSeason);
	const statLeaders = await getTeamStatLeaders(params.abbr, activeSeason, activeSeasonType);

	return {
		team,
		activeSeason,
		activeSeasonType,
		roster: groupRoster(players),
		playerCount: players.length,
		schedule,
		record: recordForTeam(schedule, team.abbreviation),
		statLeaders
	};
}
