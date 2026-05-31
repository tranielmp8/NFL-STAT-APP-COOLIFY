import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { appSettings } from '../src/lib/server/db/schema.ts';

if (!process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL is not set');
}

const currentSeason = Number(process.env.NFL_SEASON ?? 2025);
const currentSeasonType = process.env.NFL_SEASON_TYPE_LABEL ?? 'regular';

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

const existing = await client`select id from app_settings order by id limit 1`;

if (existing.length > 0) {
	await client`
		update app_settings
		set current_season = ${currentSeason},
			current_season_type = ${currentSeasonType},
			updated_at = now()
		where id = ${existing[0].id}
	`;
} else {
	await db.insert(appSettings).values({ currentSeason, currentSeasonType });
}

const [settings] =
	await client`select current_season, current_season_type from app_settings order by id limit 1`;
console.log(
	`App settings seeded. Active season: ${settings.current_season} ${settings.current_season_type}`
);

await client.end();
