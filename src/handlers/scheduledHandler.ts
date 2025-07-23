import * as db from "@/database/d1";
import { now, throwError } from "@/utils/helpers";

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
	const cutoffTimestamp = now() - HOURS_TO_DELETE * 60 * 60;

	const { success, error } = await db.deleteOldEmails(env.D1, cutoffTimestamp);

	if (success) {
		console.log("Email cleanup completed successfully.");
	} else {
		throwError(`Email cleanup failed: ${error}`);
	}
}
