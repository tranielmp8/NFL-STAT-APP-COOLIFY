import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { isAdmin } from '$lib/server/authorization';
import { getDataHealth } from '$lib/server/nfl/data-health';
import { getSeasonHistory } from '$lib/server/nfl/history';
import { getAppSettings } from '$lib/server/nfl/settings';
import { createSyncJob, isSyncJobType, listRecentSyncJobs } from '$lib/server/nfl/sync-jobs';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, '/auth/login?redirectTo=/admin/data-sync');
	}

	if (!(await isAdmin(event.locals.user.id, event.locals.user.email))) {
		return redirect(302, '/account');
	}

	const settings = await getAppSettings();
	const [health, history, jobs] = await Promise.all([
		getDataHealth(settings.currentSeason, settings.currentSeasonType),
		getSeasonHistory(),
		listRecentSyncJobs()
	]);

	return {
		settings,
		health,
		history,
		jobs
	};
};

export const actions: Actions = {
	queueJob: async (event) => {
		if (!event.locals.user) {
			return redirect(302, '/auth/login?redirectTo=/admin/data-sync');
		}

		if (!(await isAdmin(event.locals.user.id, event.locals.user.email))) {
			return fail(403, { message: 'Only admin users can queue sync jobs.' });
		}

		const formData = await event.request.formData();
		const type = String(formData.get('type') ?? '');
		const season = Number(formData.get('season'));
		const seasonType = String(formData.get('seasonType') ?? 'regular');

		if (!isSyncJobType(type)) {
			return fail(400, { message: 'Choose a valid sync job type.' });
		}

		if (!Number.isInteger(season) || season < 2020 || season > 2035) {
			return fail(400, { message: 'Season must be a year from 2020 through 2035.' });
		}

		const job = await createSyncJob({
			type,
			season,
			seasonType,
			requestedBy: event.locals.user.email
		});

		return { message: `Queued ${job.type} sync job #${job.id}.` };
	}
};
