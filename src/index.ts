import { Hono } from "hono";

import PostalMime from "postal-mime";
import { createId } from '@paralleldrive/cuid2';

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.get("/message", (c) => {
	return c.text("Hello Hono!");
});

app.get("/emails/:emailAddress", async (c) => {
	const { DB } = c.env;
	const emailAddress = c.req.param('emailAddress');
	const limit = Number(c.req.query('limit')) || 10;
	const offset = Number(c.req.query('offset')) || 0;

	const { results } = await DB.prepare(
		`SELECT id, from_address, to_address, subject, received_at
		 FROM emails
		 WHERE to_address = ?
		 ORDER BY received_at DESC
		 LIMIT ? OFFSET ?`
	)
	.bind(emailAddress, limit, offset)
	.all();

	return c.json(results);
});

app.get("/inbox/:emailId", async (c) => {
	const { DB } = c.env;
	const emailId = c.req.param('emailId');

	// Fetch email details
	const emailResult = await DB.prepare("SELECT * FROM emails WHERE id = ?").bind(emailId).first();

	if (!emailResult) {
		return c.notFound();
	}

	return c.json({
		email: emailResult,
	});
});

export default {
	fetch: app.fetch,
	async email(message: ForwardableEmailMessage, env: CloudflareBindings, ctx: ExecutionContext) {
		const email = await PostalMime.parse(message.raw);

		const emailId = createId();
		const receivedAt = Date.now();

		// Insert email data into D1
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
	},
	async scheduled(event: ScheduledEvent, env: CloudflareBindings, ctx: ExecutionContext) {
		console.log("Running scheduled email cleanup...");
		const { DB } = env;

		// Calculate the timestamp for 3 days ago
		const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000);

		const { success, error } = await DB.prepare("DELETE FROM emails WHERE received_at < ?").bind(threeDaysAgo).run();

		if (success) {
			console.log("Email cleanup completed successfully.");
		} else {
			console.error("Email cleanup failed:", error);
		}
	},
};