import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { DOMAINS_SET } from "@/config/domains";
import * as db from "@/database/d1";
import {
	emailAddressParamSchema,
	emailIdParamSchema,
	emailQuerySchema,
} from "@/schemas/emailRouterSchema";
import { ERR, OK } from "@/utils/http";
import { getDomain } from "@/utils/mail";

const emailRoutes = new Hono<{ Bindings: CloudflareBindings }>();

// GET /emails | Show all emails for a specific email address
emailRoutes.get(
	"/emails/:emailAddress",
	zValidator("param", emailAddressParamSchema),
	zValidator("query", emailQuerySchema),
	async (c) => {
		const { emailAddress } = c.req.valid("param");
		const domain = getDomain(emailAddress);
		if (!DOMAINS_SET.has(domain)) {
			return c.json(ERR("Domain not supported", { supportedDomains: Array.from(DOMAINS_SET) }));
		}

		const { limit, offset } = c.req.valid("query");
		const results = await db.getEmailsByRecipient(c.env.D1, emailAddress, limit, offset);

		return c.json(OK(results));
	},
);

// DELETE /emails | Delete all emails for a specific email address
emailRoutes.delete(
	"/emails/:emailAddress",
	zValidator("param", emailAddressParamSchema),
	async (c) => {
		const emailAddress = c.req.param("emailAddress");

		await db.deleteEmailsByRecipient(c.env.D1, emailAddress);
		return c.json(OK("Emails deleted successfully"));
	},
);

// GET /inbox/:emailId | Show a specific email inbox
emailRoutes.get("/inbox/:emailId", zValidator("param", emailIdParamSchema), async (c) => {
	const { emailId } = c.req.valid("param");
	const result = await db.getEmailById(c.env.D1, emailId);

	if (!result) return c.notFound();
	return c.json(OK(result));
});

// DELETE /inbox/:emailId | Delete a specific email inbox
emailRoutes.delete("/inbox/:emailId", zValidator("param", emailIdParamSchema), async (c) => {
	const emailId = c.req.param("emailId");

	await db.deleteEmailById(c.env.D1, emailId);
	return c.json(OK("Email deleted successfully"));
});

// GET /domains | Show a list of supported email domains
emailRoutes.get("/domains", async (c) => {
	return c.json(OK(Array.from(DOMAINS_SET)));
});

export default emailRoutes;
