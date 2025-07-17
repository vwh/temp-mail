import { createId } from "@paralleldrive/cuid2";

import PostalMime from "postal-mime";
import * as db from "@/db";
import { type Email, emailSchema } from "@/schemas/emailSchema";
import { htmlToText, textToHtmlTemplate } from "@/utils/emailContent";

/**
 * Cloudflare email router handler
 */
export async function handleEmail(
	message: ForwardableEmailMessage,
	env: CloudflareBindings,
	_ctx: ExecutionContext,
) {
	const email = await PostalMime.parse(message.raw);

	let htmlContent = email.html || null;
	let textContent = email.text || null;

	// If HTML content is missing but text content exists, generate HTML
	if (htmlContent == null && textContent != null) {
		htmlContent = textToHtmlTemplate(textContent);
	}

	// If text content is missing but HTML content exists, generate text
	else if (textContent == null && htmlContent != null) {
		textContent = htmlToText(htmlContent);
	}

	const emailData: Email = {
		id: createId(),
		from_address: message.from,
		to_address: message.to,
		subject: email.subject || null,
		received_at: Date.now(),
		html_content: htmlContent || null,
		text_content: textContent || null,
	};

	console.log("Email received:", emailData.from_address, "->", emailData.to_address);

	// Validate email data using Zod schema
	const parsedEmail = emailSchema.parse(emailData);

	// Insert email data into D1
	await db.insertEmail(env.DB, parsedEmail);
}
