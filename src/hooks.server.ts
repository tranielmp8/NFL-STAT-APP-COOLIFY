import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { building } from '$app/environment';
import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';

const publicPaths = new Set(['/auth/login', '/api/auth', '/robots.txt']);
const publicPrefixes = ['/_app/', '/api/auth/', '/auth/'];

function isPublicPath(pathname: string) {
	return publicPaths.has(pathname) || publicPrefixes.some((prefix) => pathname.startsWith(prefix));
}

const handleBetterAuth: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({ headers: event.request.headers });

	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}

	if (!building && !event.locals.user && !isPublicPath(event.url.pathname)) {
		const redirectTo = `${event.url.pathname}${event.url.search}`;
		redirect(302, `/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`);
	}

	return svelteKitHandler({ event, resolve, auth, building });
};

export const handle: Handle = handleBetterAuth;
