import PostalMime from 'postal-mime';
import { createId } from '@paralleldrive/cuid2';
import * as db from '../db';
import { htmlToText, textToHtmlTemplate } from '../utils/emailContent';

export async function handleEmail(message: ForwardableEmailMessage, env: CloudflareBindings, ctx: ExecutionContext) {
	const email = await PostalMime.parse(message.raw);

	const emailId = createId();
	const receivedAt = Date.now();

	let htmlContent: string | null | undefined = email.html;
	let textContent: string | null | undefined = email.text;

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
		id: emailId,
		from: message.from,
		to: message.to,
		subject: email.subject || null,
		receivedAt: receivedAt,
		html: htmlContent,
		text: textContent
	});
}