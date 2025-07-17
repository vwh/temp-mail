import * as db from '@/db';

import PostalMime from 'postal-mime';
import { createId } from '@paralleldrive/cuid2';

import { htmlToText, textToHtmlTemplate } from '@/utils/emailContent';
import { emailSchema, Email } from '@/schemas/emailSchema';

/**
 * Cloudflare email router handler
 */
export async function handleEmail(message: ForwardableEmailMessage, env: CloudflareBindings, ctx: ExecutionContext) {
	const email = await PostalMime.parse(message.raw);

	let htmlContent = email.html;
	let textContent = email.text;

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
		text_content: textContent || null
	};

	// Validate email data using Zod schema
	const parsedEmail = emailSchema.parse(emailData);

	// Insert email data into D1
	await db.insertEmail(env.DB, parsedEmail);
}