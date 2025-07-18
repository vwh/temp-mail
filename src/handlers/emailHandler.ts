import { createId } from "@paralleldrive/cuid2";
import PostalMime from "postal-mime";
import { updateSenderStats } from "@/database/kv";
import * as db from "@/database/queries";
import { type Email, emailSchema } from "@/schemas/emailSchema";
import { htmlToText, textToHtmlTemplate } from "@/utils/emailContent";

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
		received_at: Date.now(),
		html_content: htmlContent,
		text_content: textContent,
	};

	console.log(`Email received: ${emailData.from_address} -> ${emailData.to_address}`);

	// Validate email data (fail fast if invalid)
	const parsedEmail = emailSchema.parse(emailData);

	// Execute database insert and KV update
	const [, senderCount] = await Promise.allSettled([
		db.insertEmail(env.DB, parsedEmail),
		updateSenderStats(env.EMAIL_STATS_KV, message.from),
	]);

	if (senderCount.status === "fulfilled") {
		console.log(`Sender ${message.from} has sent ${senderCount.value} emails.`);
	} else {
		console.error("Failed to update sender stats:", senderCount.reason);
	}
}

/**
 * Process email content
 */
function processEmailContent(
	html: string | null,
	text: string | null,
): {
	htmlContent: string | null;
	textContent: string | null;
} {
	// Both exist - return as-is
	if (html && text) {
		return { htmlContent: html, textContent: text };
	}

	// Only HTML exists - generate text
	if (html && !text) {
		return { htmlContent: html, textContent: htmlToText(html) };
	}

	// Only text exists - generate HTML
	if (!html && text) {
		return { htmlContent: textToHtmlTemplate(text), textContent: text };
	}

	// Neither exists
	return { htmlContent: null, textContent: null };
}
