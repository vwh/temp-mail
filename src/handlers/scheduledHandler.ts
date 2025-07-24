import * as db from "@/database/d1";
import * as kv from "@/database/kv";
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

/**
 * Cloudflare Scheduled Function
 * Send daily top senders report
 */
export async function handleDailyReport(
	_event: ScheduledEvent,
	env: CloudflareBindings,
	ctx: ExecutionContext,
) {
	const topSenders = await kv.getTopSenders(env.KV, 10);

	const message = `*Top 10 Senders*\n\n${topSenders
		.map(({ name, count }) => `*${name}*: ${count}`)
		.join("\n")}`;

	ctx.waitUntil(sendMessage(message, env));
}
