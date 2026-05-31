import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

if (!process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL is not set');
}

const client = postgres(process.env.DATABASE_URL, {
	max: 1,
	connect_timeout: 10
});

try {
	const db = drizzle(client);
	await migrate(db, { migrationsFolder: 'drizzle' });
	console.log('Migrations applied successfully.');
} finally {
	await client.end({ timeout: 5 });
}
