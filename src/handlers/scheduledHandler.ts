import * as db from '@/db';

const DAYS_TO_DELETE = 2;

/**
 * Cloudflare Scheduled Function
 * Delete emails older than 2 days
 */
export async function handleScheduled(event: ScheduledEvent, env: CloudflareBindings, ctx: ExecutionContext) {
	const { DB } = env;

	const threeDaysAgo = Date.now() - (DAYS_TO_DELETE * 24 * 60 * 60 * 1000);

	// Delete old emails
	const { success, error } = await db.deleteOldEmails(DB, threeDaysAgo);

	if (success) {
		console.log("Email cleanup completed successfully.");
	} else {
		console.error("Email cleanup failed:", error);
	}
}