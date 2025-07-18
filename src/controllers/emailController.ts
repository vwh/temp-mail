import type { Handler } from "hono";
import * as db from "@/database/queries";
import { DOMAINS } from "@/domains";
import type { Email, EmailSummary } from "@/schemas/emailSchema";
import { ERR, OK } from "@/utils/response";

type Env = {
	Bindings: CloudflareBindings;
};

export const getEmails: Handler<Env> = async (c) => {
	const { DB } = c.env;

	const emailAddress = c.req.param("emailAddress");
	const domain = emailAddress.split("@")[1];

	if (!DOMAINS.includes(domain)) {
		return c.json(ERR("Domain not supported", { supportedDomains: DOMAINS }));
	}

	const limit = Number(c.req.query("limit")) || 10;
	const offset = Number(c.req.query("offset")) || 0;

	const results = (await db.getEmailsByRecipient(
		DB,
		emailAddress,
		limit,
		offset,
	)) as EmailSummary[];

	return c.json(OK(results));
};

export const getEmailById: Handler<Env> = async (c) => {
	const { DB } = c.env;

	const emailId = c.req.param("emailId");

	const result = (await db.getEmailById(DB, emailId)) as Email | null;

	if (!result) {
		return c.notFound();
	}

	return c.json(OK(result));
};

export const deleteEmailsByAddress: Handler<Env> = async (c) => {
	const { DB } = c.env;

	const emailAddress = c.req.param("emailAddress");

	await db.deleteEmailsByRecipient(DB, emailAddress);

	return c.json(OK("Emails deleted successfully"));
};

export const deleteEmailById: Handler<Env> = async (c) => {
	const { DB } = c.env;

	const emailId = c.req.param("emailId");

	await db.deleteEmailById(DB, emailId);

	return c.json(OK("Email deleted successfully"));
};

export const getSupportedDomains: Handler<Env> = async (c) => {
	const results = DOMAINS;

	return c.json(OK(results));
};
