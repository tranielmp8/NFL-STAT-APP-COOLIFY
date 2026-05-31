import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { teamSeeds } from '../src/lib/server/nfl/team-data.ts';
import { teams } from '../src/lib/server/db/schema.ts';

if (!process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL is not set');
}

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

for (const team of teamSeeds) {
	await db
		.insert(teams)
		.values(team)
		.onConflictDoUpdate({
			target: teams.espnId,
			set: {
				abbreviation: team.abbreviation,
				name: team.name,
				city: team.city,
				conference: team.conference,
				division: team.division,
				colorPrimary: team.colorPrimary,
				colorSecondary: team.colorSecondary,
				logoUrl: team.logoUrl,
				updatedAt: new Date()
			}
		});
}

const count = await client`select count(*)::int as count from teams`;
console.log(`Seeded teams table. Total teams: ${count[0].count}`);

await client.end();
