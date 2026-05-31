import { error } from '@sveltejs/kit';
import { getPlayerById } from '$lib/server/nfl/players';
import { getPlayerStats } from '$lib/server/nfl/stats';
import { getAppSettings } from '$lib/server/nfl/settings';
import { ensureTeamsSeeded, getTeamByAbbreviation } from '$lib/server/nfl/teams';

const seasonTypes = new Set(['preseason', 'regular', 'postseason']);

export async function load({ params, url }) {
	await ensureTeamsSeeded();

	const team = await getTeamByAbbreviation(params.abbr);
	const player = await getPlayerById(Number(params.playerId));
	const settings = await getAppSettings();

	if (!team || !player || player.teamId !== team.id) {
		error(404, 'Player not found');
	}

	const seasonParam = Number(url.searchParams.get('season'));
	const typeParam = url.searchParams.get('type') ?? settings.currentSeasonType;
	const activeSeason = Number.isInteger(seasonParam) ? seasonParam : settings.currentSeason;
	const activeSeasonType = seasonTypes.has(typeParam) ? typeParam : settings.currentSeasonType;
	const stats = await getPlayerStats(player.id, activeSeason, activeSeasonType);

	return {
		team,
		player,
		stats,
		activeSeason,
		activeSeasonType
	};
}
