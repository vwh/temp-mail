import PostalMime from 'postal-mime';
import { createId } from '@paralleldrive/cuid2';
import * as db from '../db';

export async function handleEmail(message: ForwardableEmailMessage, env: CloudflareBindings, ctx: ExecutionContext) {
	const email = await PostalMime.parse(message.raw);

	const emailId = createId();
	const receivedAt = Date.now();

	await db.insertEmail(env.DB, {
		id: emailId,
		from: message.from,
		to: message.to,
		subject: email.subject || null,
		receivedAt: receivedAt,
		html: email.html || null,
		text: email.text || null
	});
}