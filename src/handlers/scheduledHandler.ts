import * as db from "@/database/d1";
import { now } from "@/utils/helpers";
import { logInfo } from "@/utils/logger";
import { sendMessage } from "@/utils/telegram";

/**
 * Cloudflare Scheduled Function
 * Delete emails older than 4 hours
 */
export async function handleScheduled(
	_event: ScheduledEvent,
	env: CloudflareBindings,
	ctx: ExecutionContext,
) {
	const cutoffTimestamp = now() - env.HOURS_TO_DELETE_D1 * 60 * 60;

	const { success, error } = await db.deleteOldEmails(env.D1, cutoffTimestamp);

	if (success) {
		logInfo("Email cleanup completed successfully.");
		ctx.waitUntil(sendMessage("Email cleanup completed successfully.", env));
	} else {
		throw new Error(`Email cleanup failed: ${error}`);
	}
}
