import { getUserRole } from '$lib/server/authorization';
import { ensureTeamsSeeded, getAllTeams } from '$lib/server/nfl/teams';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	await ensureTeamsSeeded();
	const teams = await getAllTeams();
	const role = event.locals.user
		? await getUserRole(event.locals.user.id, event.locals.user.email)
		: 'user';

	return { teams, user: event.locals.user ?? null, role };
};
