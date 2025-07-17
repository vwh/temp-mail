import type { Handler } from "hono";
import * as db from "@/db";
import type { Email, EmailSummary } from "@/schemas/emailSchema";

type Env = {
	Bindings: CloudflareBindings;
};

export const getEmails: Handler<Env> = async (c) => {
	const { DB } = c.env;
	
	const emailAddress = c.req.param("emailAddress");
	
	const limit = Number(c.req.query("limit")) || 10;
	const offset = Number(c.req.query("offset")) || 0;

	const results = (await db.getEmailsByRecipient(
		DB,
		emailAddress,
		limit,
		offset,
	)) as EmailSummary[];

	return c.json(results);
};

export const getEmailById: Handler<Env> = async (c) => {
	const { DB } = c.env;
	
	const emailId = c.req.param("emailId");

	const result = (await db.getEmailById(DB, emailId)) as Email | null;

	if (!result) {
		return c.notFound();
	}

	return c.json(result);
};

export const deleteEmailsByAddress: Handler<Env> = async (c) => {
	const { DB } = c.env;
	
	const emailAddress = c.req.param("emailAddress");

	await db.deleteEmailsByRecipient(DB, emailAddress);

	return c.json({ 
		message: `Emails for ${emailAddress} deleted successfully.` 
	});
};

export const deleteEmailById: Handler<Env> = async (c) => {
	const { DB } = c.env;
	
	const emailId = c.req.param("emailId");

	await db.deleteEmailById(DB, emailId);

	return c.json({ 
		message: `Email with ID ${emailId} deleted successfully.` 
	});
};