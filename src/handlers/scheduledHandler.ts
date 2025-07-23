import * as db from "@/database/d1";
import * as kv from "@/database/kv";
import { now, throwError } from "@/utils/helpers";
import { sendMessage } from "@/utils/telegram";

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
		await sendMessage("Email cleanup completed successfully.", env);
	} else {
		throwError(`Email cleanup failed: ${error}`);
	}
}

/**
 * Cloudflare Scheduled Function
 * Send daily top senders report
 */
export async function handleDailyReport(
	_event: ScheduledEvent,
	env: CloudflareBindings,
	_ctx: ExecutionContext,
) {
	const topSenders = await kv.getTopSenders(env.KV, 10);

	const message = `*Top 10 Senders*\n\n${topSenders
		.map(({ name, count }) => `*${name}*: ${count}`)
		.join("\n")}`;

	await sendMessage(message, env);
}
