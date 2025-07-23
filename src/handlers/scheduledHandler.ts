import * as db from "@/database/queries";
import { now } from "@/utils/date";
import { throwError } from "@/utils/error";

const HOURS_TO_DELETE = 4;

/**
 * Cloudflare Scheduled Function
 * Delete emails older than 4 hours
 */
export async function handleScheduled(
	_event: ScheduledEvent,
	env: CloudflareBindings,
	_ctx: ExecutionContext,
) {
	const cutoffTimestamp = now() - HOURS_TO_DELETE * 60 * 60; // 4 hours ago in seconds

	// Delete old emails
	const { success, error } = await db.deleteOldEmails(env.DB, cutoffTimestamp);

	if (success) {
		console.log("Email cleanup completed successfully.");
	} else {
		throwError(`Email cleanup failed: ${error}`);
	}
}
