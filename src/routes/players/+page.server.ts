import { getUserRole } from '$lib/server/authorization';
import { searchPlayers } from '$lib/server/nfl/players';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const query = event.url.searchParams.get('q') ?? '';
	const players = await searchPlayers(query);
	const role = event.locals.user
		? await getUserRole(event.locals.user.id, event.locals.user.email)
		: 'user';

	return {
		query,
		players,
		user: event.locals.user ?? null,
		role
	};
};
