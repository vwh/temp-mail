import * as db from '../db';

import PostalMime from 'postal-mime';
import { createId } from '@paralleldrive/cuid2';

import { htmlToText, textToHtmlTemplate } from '../utils/emailContent';

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

	// Insert email data into D1
	await db.insertEmail(env.DB, {
		id: createId(),
		from: message.from,
		to: message.to,
		subject: email.subject || null,
		receivedAt: Date.now(),
		html: htmlContent || null,
		text: textContent || null
	});
}