import PostalMime from 'postal-mime';
import { createId } from '@paralleldrive/cuid2';

export async function handleEmail(message: ForwardableEmailMessage, env: CloudflareBindings, ctx: ExecutionContext) {
	const email = await PostalMime.parse(message.raw);

	const emailId = createId();
	const receivedAt = Date.now();

	await env.DB.prepare(
		`INSERT INTO emails (id, from_address, to_address, subject, received_at, html_content, text_content)
		 VALUES (?, ?, ?, ?, ?, ?, ?)`
	)
	.bind(
		emailId,
		message.from,
		message.to,
		email.subject,
		receivedAt,
		email.html || null,
		email.text || null
	)
	.run();

	console.log('Email received and saved to D1');
	console.log(`From: ${message.from}`);
	console.log(`To: ${message.to}`);
	console.log('Subject:', email.subject);
}