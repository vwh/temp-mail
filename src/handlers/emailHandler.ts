import PostalMime from 'postal-mime';
import { createId } from '@paralleldrive/cuid2';
import * as db from '../db';

export async function handleEmail(message: ForwardableEmailMessage, env: CloudflareBindings, ctx: ExecutionContext) {
	const email = await PostalMime.parse(message.raw);

	const emailId = createId();
	const receivedAt = Date.now();

	// Insert email data into D1
	await db.insertEmail(env.DB, {
		id: emailId,
		from: message.from,
		to: message.to,
		subject: email.subject || null,
		receivedAt: receivedAt,
		html: email.html || null,
		text: email.text || null
	});

	console.log('Email received and saved to D1');
	console.log(`From: ${message.from}`);
	console.log(`To: ${message.to}`);
	console.log('Subject:', email.subject);
}