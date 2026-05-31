import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { getUserRole } from '$lib/server/authorization';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, '/auth/login');
	}

	const role = await getUserRole(event.locals.user.id, event.locals.user.email);

	return { user: event.locals.user, role };
};

export const actions: Actions = {
	signOut: async (event) => {
		await auth.api.signOut({
			headers: event.request.headers
		});

		return redirect(302, '/auth/login');
	}
};
