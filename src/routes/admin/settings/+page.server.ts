import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { asc, eq } from 'drizzle-orm';
import { isAdmin } from '$lib/server/authorization';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { getSeasonHistory } from '$lib/server/nfl/history';
import { getAppSettings, updateCurrentSeason } from '$lib/server/nfl/settings';

const seasonTypes = new Set(['preseason', 'regular', 'postseason']);
const userRoles = new Set(['admin', 'user']);

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, '/auth/login?redirectTo=/admin/settings');
	}

	if (!(await isAdmin(event.locals.user.id, event.locals.user.email))) {
		return redirect(302, '/account');
	}

	const [settings, history, users] = await Promise.all([
		getAppSettings(),
		getSeasonHistory(),
		db
			.select({
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt
			})
			.from(user)
			.orderBy(asc(user.email))
	]);

	return {
		user: event.locals.user,
		settings,
		history,
		users
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
	},

	updateUserRole: async (event) => {
		if (!event.locals.user) {
			return redirect(302, '/auth/login?redirectTo=/admin/settings');
		}

		if (!(await isAdmin(event.locals.user.id, event.locals.user.email))) {
			return fail(403, { message: 'Only admin users can update user roles.' });
		}

		const formData = await event.request.formData();
		const userId = String(formData.get('userId') ?? '');
		const role = String(formData.get('role') ?? 'user');

		if (!userId) {
			return fail(400, { message: 'Choose a user to update.' });
		}

		if (!userRoles.has(role)) {
			return fail(400, { message: 'Choose a valid role.' });
		}

		if (userId === event.locals.user.id && role !== 'admin') {
			return fail(400, { message: 'You cannot remove your own admin access.' });
		}

		const [updated] = await db
			.update(user)
			.set({ role, updatedAt: new Date() })
			.where(eq(user.id, userId))
			.returning({ email: user.email, role: user.role });

		if (!updated) {
			return fail(404, { message: 'User not found.' });
		}

		return { message: `${updated.email} is now ${updated.role}.` };
	}
};
