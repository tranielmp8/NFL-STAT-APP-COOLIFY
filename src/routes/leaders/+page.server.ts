import { getUserRole } from '$lib/server/authorization';
import { getAppSettings } from '$lib/server/nfl/settings';
import { getLeagueLeaders, leagueLeaderConfigs } from '$lib/server/nfl/stats';
import type { PageServerLoad } from './$types';

const seasonTypes = new Set(['preseason', 'regular', 'postseason']);

export const load: PageServerLoad = async (event) => {
	const settings = await getAppSettings();
	const category = event.url.searchParams.get('category') ?? 'passing';
	const seasonParam = Number(event.url.searchParams.get('season'));
	const typeParam = event.url.searchParams.get('type') ?? settings.currentSeasonType;
	const season = Number.isInteger(seasonParam) ? seasonParam : settings.currentSeason;
	const seasonType = seasonTypes.has(typeParam) ? typeParam : settings.currentSeasonType;
	const leaders = await getLeagueLeaders(category, season, seasonType);
	const role = event.locals.user
		? await getUserRole(event.locals.user.id, event.locals.user.email)
		: 'user';

	return {
		category: leaders.config.key,
		categoryLabel: leaders.config.label,
		suffix: leaders.config.suffix,
		categories: leagueLeaderConfigs.map(({ key, label }) => ({ key, label })),
		season,
		seasonType,
		rows: leaders.rows,
		user: event.locals.user ?? null,
		role
	};
};
