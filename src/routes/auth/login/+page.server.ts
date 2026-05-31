import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { APIError } from 'better-auth/api';

function safeRedirectTo(value: string | null) {
	if (!value || !value.startsWith('/') || value.startsWith('//')) return '/account';
	if (value.startsWith('/auth/')) return '/account';
	return value;
}

export const load: PageServerLoad = (event) => {
	if (event.locals.user) {
		return redirect(302, safeRedirectTo(event.url.searchParams.get('redirectTo')));
	}

	return {};
};

export const actions: Actions = {
	signInEmail: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';
		const redirectTo = safeRedirectTo(event.url.searchParams.get('redirectTo'));

		try {
			await auth.api.signInEmail({
				body: {
					email,
					password,
					callbackURL: redirectTo
				}
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { message: error.message || 'Sign in failed' });
			}
			return fail(500, { message: 'Unexpected error' });
		}

		return redirect(302, redirectTo);
	},
	signUpEmail: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';
		const confirmPassword = formData.get('confirmPassword')?.toString() ?? '';
		const name = formData.get('name')?.toString() ?? '';
		const redirectTo = safeRedirectTo(event.url.searchParams.get('redirectTo'));

		if (password !== confirmPassword) {
			return fail(400, { message: 'Passwords do not match' });
		}

		try {
			await auth.api.signUpEmail({
				body: {
					email,
					password,
					name,
					callbackURL: redirectTo
				}
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { message: error.message || 'Registration failed' });
			}
			return fail(500, { message: 'Unexpected error' });
		}

		return redirect(302, redirectTo);
	}
};
