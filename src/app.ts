import { Hono } from "hono";
import * as db from './db';

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.get("/message", (c) => {
	return c.text("Hello Hono!");
});

app.get("/emails/:emailAddress", async (c) => {
	const { DB } = c.env;
	const emailAddress = c.req.param('emailAddress');
	const limit = Number(c.req.query('limit')) || 10;
	const offset = Number(c.req.query('offset')) || 0;

	const results = await db.getEmailsByRecipient(DB, emailAddress, limit, offset);

	return c.json(results);
});

app.get("/inbox/:emailId", async (c) => {
	const { DB } = c.env;
	const emailId = c.req.param('emailId');

	const result = await db.getEmailById(DB, emailId);

	if (!result) {
		return c.notFound();
	}

	return c.json(result);
});

export default app;