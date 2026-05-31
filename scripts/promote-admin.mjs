import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import postgres from 'postgres';
import { user } from '../src/lib/server/db/schema.ts';

const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

if (!process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL is required.');
}

if (!adminEmail) {
	throw new Error(
		'ADMIN_EMAIL is required. Add it to .env with the email address you use to sign in.'
	);
}

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

const [updated] = await db
	.update(user)
	.set({ role: 'admin', updatedAt: new Date() })
	.where(eq(user.email, adminEmail))
	.returning({ id: user.id, email: user.email, role: user.role });

await client.end();

if (!updated) {
	throw new Error(`No user found for ${adminEmail}. Sign up first, then run this command again.`);
}

console.log(`Promoted ${updated.email} to ${updated.role}.`);
