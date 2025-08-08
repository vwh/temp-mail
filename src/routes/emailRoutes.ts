import { OpenAPIHono } from "@hono/zod-openapi";
import { CACHE } from "@/config/constants";
import { DOMAINS_SET } from "@/config/domains";
import * as db from "@/database/d1";
import validateDomain from "@/middlewares/validateDomain";
import {
	deleteEmailRoute,
	deleteEmailsRoute,
	getDomainsRoute,
	getEmailRoute,
	getEmailsCountRoute,
	getEmailsRoute,
} from "@/schemas/emails/routeDefinitions";
import { ERR, OK } from "@/utils/http";

const emailRoutes = new OpenAPIHono<{ Bindings: CloudflareBindings }>();

// --- Middlewares ---
emailRoutes.use("/emails/:emailAddress", validateDomain);
emailRoutes.use("/emails/count/:emailAddress", validateDomain);

// --- Routes ---
// GET /emails/{emailAddress}
// @ts-ignore - OpenAPI route handler type mismatch with error response status codes
emailRoutes.openapi(getEmailsRoute, async (c) => {
	const { emailAddress } = c.req.valid("param");
	const { limit, offset } = c.req.valid("query");

	const { results, error } = await db.getEmailsByRecipient(c.env.D1, emailAddress, limit, offset);

	if (error) return c.json(ERR(error.message, "D1Error"), 500);
	return c.json(OK(results));
});

// GET /emails/count/{emailAddress}
// @ts-ignore - OpenAPI route handler type mismatch with error response status codes
emailRoutes.openapi(getEmailsCountRoute, async (c) => {
	const { emailAddress } = c.req.valid("param");

	const { count, error } = await db.countEmailsByRecipient(c.env.D1, emailAddress);

	if (error) return c.json(ERR(error.message, "D1Error"), 500);
	return c.json(OK({ count }));
});

// DELETE /emails/{emailAddress}
// @ts-ignore - OpenAPI route handler type mismatch with error response status codes
emailRoutes.openapi(deleteEmailsRoute, async (c) => {
	const { emailAddress } = c.req.valid("param");

	const { meta, error } = await db.deleteEmailsByRecipient(c.env.D1, emailAddress);

	if (error) return c.json(ERR(error.message, "D1Error"), 500);
	if (meta && meta.changes === 0)
		return c.json(ERR("No emails found for deletion", "NotFound"), 404);
	return c.json(OK({ message: "Emails deleted successfully", deleted_count: meta?.changes }));
});

// GET /inbox/{emailId}
// @ts-ignore - OpenAPI route handler type mismatch with error response status codes
emailRoutes.openapi(getEmailRoute, async (c) => {
	const { emailId } = c.req.valid("param");
	const { result, error } = await db.getEmailById(c.env.D1, emailId);

	if (error) return c.json(ERR(error.message, "D1Error"), 500);
	if (!result) return c.json(ERR("Email not found", "NotFound"), 404);
	return c.json(OK(result));
});

// DELETE /inbox/{emailId}
// @ts-ignore - OpenAPI route handler type mismatch with error response status codes
emailRoutes.openapi(deleteEmailRoute, async (c) => {
	const { emailId } = c.req.valid("param");
	const { meta, error } = await db.deleteEmailById(c.env.D1, emailId);

	if (error) return c.json(ERR(error.message, "D1Error"), 500);
	if (meta && meta.changes === 0) return c.json(ERR("Email not found", "NotFound"), 404);
	return c.json(OK({ message: "Email deleted successfully" }));
});

// GET /domains
emailRoutes.openapi(getDomainsRoute, async (c) => {
	// Set cache headers for better performance
	c.header("Cache-Control", `public, max-age=${CACHE.DOMAINS_TTL}`);
	c.header("ETag", `"domains-${DOMAINS_SET.size}"`);

	return c.json(OK(Array.from(DOMAINS_SET)));
});

export default emailRoutes;
