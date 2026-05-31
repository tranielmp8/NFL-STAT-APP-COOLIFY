import { error } from '@sveltejs/kit';
import { getPlayerById } from '$lib/server/nfl/players';
import { getPlayerStats } from '$lib/server/nfl/stats';
import { getAppSettings } from '$lib/server/nfl/settings';
import { ensureTeamsSeeded, getTeamByAbbreviation } from '$lib/server/nfl/teams';

export async function load({ params }) {
	await ensureTeamsSeeded();

	const team = await getTeamByAbbreviation(params.abbr);
	const player = await getPlayerById(Number(params.playerId));
	const settings = await getAppSettings();

	if (!team || !player || player.teamId !== team.id) {
		error(404, 'Player not found');
	}

	const stats = await getPlayerStats(player.id, settings.currentSeason, settings.currentSeasonType);

	return {
		team,
		player,
		stats,
		activeSeason: settings.currentSeason,
		activeSeasonType: settings.currentSeasonType
	};
}
