import { eq } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';

export type UserRole = 'admin' | 'user';

export async function getUserRole(userId: string, email?: string | null): Promise<UserRole> {
	if (email && env.ADMIN_EMAIL && email.toLowerCase() === env.ADMIN_EMAIL.toLowerCase()) {
		return 'admin';
	}

	const [row] = await db.select({ role: user.role }).from(user).where(eq(user.id, userId)).limit(1);
	return row?.role === 'admin' ? 'admin' : 'user';
}

export async function isAdmin(userId: string, email?: string | null) {
	return (await getUserRole(userId, email)) === 'admin';
}
