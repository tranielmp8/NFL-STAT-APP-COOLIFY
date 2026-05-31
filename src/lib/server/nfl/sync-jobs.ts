import { and, desc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { syncJobs } from '$lib/server/db/schema';

export const syncJobTypes = ['teams', 'rosters', 'schedules', 'stats', 'full'] as const;
export const syncJobStatuses = ['queued', 'running', 'completed', 'failed', 'canceled'] as const;

export type SyncJobType = (typeof syncJobTypes)[number];
export type SyncJobStatus = (typeof syncJobStatuses)[number];
export type SyncJob = typeof syncJobs.$inferSelect;

export function isSyncJobType(value: string): value is SyncJobType {
	return syncJobTypes.includes(value as SyncJobType);
}

export async function createSyncJob(values: {
	type: SyncJobType;
	season: number;
	seasonType: string;
	requestedBy?: string | null;
}) {
	const [job] = await db
		.insert(syncJobs)
		.values({
			type: values.type,
			season: values.season,
			seasonType: values.seasonType,
			requestedBy: values.requestedBy,
			message: 'Queued from admin data sync page.'
		})
		.returning();

	return job;
}

export async function listRecentSyncJobs(limit = 10) {
	return db.select().from(syncJobs).orderBy(desc(syncJobs.createdAt)).limit(limit);
}

export async function markSyncJobRunning(id: number, message = 'Sync job started.') {
	const [job] = await db
		.update(syncJobs)
		.set({ status: 'running', message, startedAt: new Date(), updatedAt: new Date() })
		.where(eq(syncJobs.id, id))
		.returning();

	return job;
}

export async function markSyncJobCompleted(id: number, message = 'Sync job completed.') {
	const [job] = await db
		.update(syncJobs)
		.set({ status: 'completed', message, finishedAt: new Date(), updatedAt: new Date() })
		.where(eq(syncJobs.id, id))
		.returning();

	return job;
}

export async function markSyncJobFailed(id: number, error: string) {
	const [job] = await db
		.update(syncJobs)
		.set({ status: 'failed', error, finishedAt: new Date(), updatedAt: new Date() })
		.where(eq(syncJobs.id, id))
		.returning();

	return job;
}

export async function cancelQueuedSyncJob(id: number, canceledBy?: string | null) {
	const [job] = await db
		.update(syncJobs)
		.set({
			status: 'canceled',
			message: canceledBy ? `Canceled by ${canceledBy}.` : 'Canceled.',
			finishedAt: new Date(),
			updatedAt: new Date()
		})
		.where(and(eq(syncJobs.id, id), eq(syncJobs.status, 'queued')))
		.returning();

	return job;
}
