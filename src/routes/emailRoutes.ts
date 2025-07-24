import { OpenAPIHono } from "@hono/zod-openapi";
import { DOMAINS_SET } from "@/config/domains";
import * as db from "@/database/d1";
import {
	deleteEmailRoute,
	deleteEmailsRoute,
	getDomainsRoute,
	getEmailRoute,
	getEmailsRoute,
} from "@/schemas/emails/routeDefinitions";
import { ERR, OK } from "@/utils/http";
import { getDomain } from "@/utils/mail";
import validateDomain from "@/middlewares/validateDomain";

const emailRoutes = new OpenAPIHono<{ Bindings: CloudflareBindings }>();

emailRoutes.use("/emails/{emailAddress}", validateDomain);

// GET /emails/{emailAddress}
// @ts-ignore - Ignoring OpenAPI type mismatch for utility functions
emailRoutes.openapi(getEmailsRoute, async (c) => {
	const { emailAddress } = c.req.valid("param");

	const { limit, offset } = c.req.valid("query");
	const results = await db.getEmailsByRecipient(c.env.D1, emailAddress, limit, offset);

	return c.json(OK(results));
});

// DELETE /emails/{emailAddress}
// @ts-ignore - Ignoring OpenAPI type mismatch for utility functions
emailRoutes.openapi(deleteEmailsRoute, async (c) => {
	const { emailAddress } = c.req.valid("param");

	await db.deleteEmailsByRecipient(c.env.D1, emailAddress);
	return c.json(OK({ message: "Emails deleted successfully" }));
});

// GET /inbox/{emailId}
// @ts-ignore - Ignoring OpenAPI type mismatch for utility functions
emailRoutes.openapi(getEmailRoute, async (c) => {
	const { emailId } = c.req.valid("param");
	const result = await db.getEmailById(c.env.D1, emailId);

	if (!result) return c.notFound();
	return c.json(OK(result));
});

// DELETE /inbox/{emailId}
// @ts-ignore - Ignoring OpenAPI type mismatch for utility functions
emailRoutes.openapi(deleteEmailRoute, async (c) => {
	const { emailId } = c.req.valid("param");

	await db.deleteEmailById(c.env.D1, emailId);
	return c.json(OK({ message: "Email deleted successfully" }));
});

// GET /domains
emailRoutes.openapi(getDomainsRoute, async (c) => {
	c.header("Cache-Control", "public, max-age=3600");
	return c.json(OK(Array.from(DOMAINS_SET)));
});

export default emailRoutes;
