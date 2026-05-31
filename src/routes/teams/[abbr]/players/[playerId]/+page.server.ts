import { error } from '@sveltejs/kit';
import { getUserRole } from '$lib/server/authorization';
import { getPlayerById } from '$lib/server/nfl/players';
import { getPlayerStatHistory, getPlayerStats } from '$lib/server/nfl/stats';
import { getAppSettings } from '$lib/server/nfl/settings';
import { ensureTeamsSeeded, getTeamByAbbreviation } from '$lib/server/nfl/teams';

const seasonTypes = new Set(['preseason', 'regular', 'postseason']);

export async function load({ params, url, locals }) {
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
	const [stats, history] = await Promise.all([
		getPlayerStats(player.id, activeSeason, activeSeasonType),
		getPlayerStatHistory(player.id)
	]);
	const role = locals.user ? await getUserRole(locals.user.id, locals.user.email) : 'user';

	return {
		team,
		player,
		stats,
		history,
		activeSeason,
		activeSeasonType,
		role
	};
}
