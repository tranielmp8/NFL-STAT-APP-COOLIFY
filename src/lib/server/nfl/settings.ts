import { asc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { appSettings } from '$lib/server/db/schema';

export type AppSettings = typeof appSettings.$inferSelect;

const defaultSettings = {
	currentSeason: 2025,
	currentSeasonType: 'regular'
};

export async function ensureAppSettings() {
	const [settings] = await db.select().from(appSettings).orderBy(asc(appSettings.id)).limit(1);
	if (settings) return settings;

	const [created] = await db.insert(appSettings).values(defaultSettings).returning();
	return created;
}

export async function getAppSettings() {
	return ensureAppSettings();
}

export async function updateCurrentSeason(currentSeason: number, currentSeasonType = 'regular') {
	const settings = await ensureAppSettings();
	const [updated] = await db
		.update(appSettings)
		.set({ currentSeason, currentSeasonType, updatedAt: new Date() })
		.where(eq(appSettings.id, settings.id))
		.returning();

	return updated;
}
