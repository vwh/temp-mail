import { createId } from "@paralleldrive/cuid2";
import PostalMime from "postal-mime";
import * as db from "@/database/d1";
import { updateSenderStats } from "@/database/kv";
import { type Email, emailSchema } from "@/schemas/emailSchema";
import { now, throwError } from "@/utils/helpers";
import { processEmailContent } from "@/utils/mail";

/**
 * Cloudflare email router handler - optimized version
 */
export async function handleEmail(
	message: ForwardableEmailMessage,
	env: CloudflareBindings,
	_ctx: ExecutionContext,
) {
	const [email, emailId] = await Promise.all([
		PostalMime.parse(message.raw),
		Promise.resolve(createId()),
	]);

	const { htmlContent, textContent } = processEmailContent(email.html ?? null, email.text ?? null);

	const emailData: Email = {
		id: emailId,
		from_address: message.from,
		to_address: message.to,
		subject: email.subject || null,
		received_at: now(),
		html_content: htmlContent,
		text_content: textContent,
	};

	console.log(`Email received: ${emailData.from_address} -> ${emailData.to_address}`);

	// Validate email data (fail fast if invalid)
	const parsedEmail = emailSchema.parse(emailData);

	// Execute database insert and KV update
	const [emailResult, senderCount] = await Promise.allSettled([
		db.insertEmail(env.D1, parsedEmail),
		updateSenderStats(env.KV, message.from),
	]);

	if (emailResult.status === "rejected") {
		throwError(`Failed to insert email: ${emailResult.reason}`);
	}

	if (senderCount.status === "rejected") {
		throwError(`Failed to update sender stats: ${senderCount.reason}`);
	}
}
