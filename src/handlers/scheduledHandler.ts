import * as db from "@/database/queries";
import { now } from "@/utils/date";
import { throwError } from "@/utils/error";

const DAYS_TO_DELETE = 2;

/**
 * Cloudflare Scheduled Function
 * Delete emails older than 2 days
 */
export async function handleScheduled(
	_event: ScheduledEvent,
	env: CloudflareBindings,
	_ctx: ExecutionContext,
) {
	const threeDaysAgo = now() - DAYS_TO_DELETE * 24 * 60 * 60;

	// Delete old emails
	const { success, error } = await db.deleteOldEmails(env.DB, threeDaysAgo);

	if (success) {
		console.log("Email cleanup completed successfully.");
	} else {
		throwError(`Email cleanup failed: ${error}`);
	}
}
