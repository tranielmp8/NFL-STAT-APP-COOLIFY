import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { isAdmin } from '$lib/server/authorization';
import { getSeasonHistory } from '$lib/server/nfl/history';
import { getAppSettings, updateCurrentSeason } from '$lib/server/nfl/settings';

const seasonTypes = new Set(['preseason', 'regular', 'postseason']);

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, '/auth/login?redirectTo=/admin/settings');
	}

	if (!(await isAdmin(event.locals.user.id, event.locals.user.email))) {
		return redirect(302, '/account');
	}

	const [settings, history] = await Promise.all([getAppSettings(), getSeasonHistory()]);

	return {
		user: event.locals.user,
		settings,
		history
	};
};

export const actions: Actions = {
	updateSeason: async (event) => {
		if (!event.locals.user) {
			return redirect(302, '/auth/login?redirectTo=/admin/settings');
		}

		if (!(await isAdmin(event.locals.user.id, event.locals.user.email))) {
			return fail(403, { message: 'Only admin users can update app settings.' });
		}

		const formData = await event.request.formData();
		const season = Number(formData.get('season'));
		const seasonType = String(formData.get('seasonType') ?? 'regular');

		if (!Number.isInteger(season) || season < 2020 || season > 2035) {
			return fail(400, {
				message: 'Season must be a year from 2020 through 2035.',
				season,
				seasonType
			});
		}

		if (!seasonTypes.has(seasonType)) {
			return fail(400, {
				message: 'Season type must be preseason, regular, or postseason.',
				season,
				seasonType: 'regular'
			});
		}

		const settings = await updateCurrentSeason(season, seasonType);

		return {
			message: `Active season updated to ${settings.currentSeason} ${settings.currentSeasonType}.`
		};
	}
};
