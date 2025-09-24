// External imports
import { OpenAPIHono } from "@hono/zod-openapi";

// Configuration imports
import { CACHE } from "@/config/constants";
import { DOMAINS_SET } from "@/config/domains";

// Database imports
import { createDatabaseService } from "@/database";

// Schema imports
import {
	deleteEmailRoute,
	deleteEmailsRoute,
	getDomainsRoute,
	getEmailRoute,
	getEmailsCountRoute,
	getEmailsRoute,
} from "@/schemas/emails/routeDefinitions";

// Utility imports
import { ERR, OK } from "@/utils/http";
import { validateEmailDomain } from "@/utils/validation";

const emailRoutes = new OpenAPIHono<{ Bindings: CloudflareBindings }>();

// @ts-ignore - OpenAPI route handler type mismatch with error response status codes
emailRoutes.openapi(getEmailsRoute, async (c) => {
	const { emailAddress } = c.req.valid("param");
	const { limit, offset } = c.req.valid("query");

	const domainValidation = validateEmailDomain(emailAddress);
	if (!domainValidation.valid) return c.json(domainValidation.error, 404);

	const dbService = createDatabaseService(c.env.D1);
	const { results, error } = await dbService.getEmailsByRecipient(emailAddress, limit, offset);

	if (error) return c.json(ERR(error.message, "D1Error"), 500);
	return c.json(OK(results));
});

// @ts-ignore - OpenAPI route handler type mismatch with error response status codes
emailRoutes.openapi(getEmailsCountRoute, async (c) => {
	const { emailAddress } = c.req.valid("param");

	const domainValidation = validateEmailDomain(emailAddress);
	if (!domainValidation.valid) return c.json(domainValidation.error, 404);

	const dbService = createDatabaseService(c.env.D1);
	const { count, error } = await dbService.countEmailsByRecipient(emailAddress);

	if (error) return c.json(ERR(error.message, "D1Error"), 500);
	return c.json(OK({ count }));
});

// @ts-ignore - OpenAPI route handler type mismatch with error response status codes
emailRoutes.openapi(deleteEmailsRoute, async (c) => {
	const { emailAddress } = c.req.valid("param");

	const domainValidation = validateEmailDomain(emailAddress);
	if (!domainValidation.valid) return c.json(domainValidation.error, 404);

	const dbService = createDatabaseService(c.env.D1);
	const { meta, error } = await dbService.deleteEmailsByRecipient(emailAddress);

	if (error) return c.json(ERR(error.message, "D1Error"), 500);
	if (meta && meta.changes === 0)
		return c.json(ERR("No emails found for deletion", "NotFound"), 404);
	return c.json(OK({ message: "Emails deleted successfully", deleted_count: meta?.changes }));
});

// @ts-ignore - OpenAPI route handler type mismatch with error response status codes
emailRoutes.openapi(getEmailRoute, async (c) => {
	const { emailId } = c.req.valid("param");
	const dbService = createDatabaseService(c.env.D1);
	const { result, error } = await dbService.getEmailById(emailId);

	if (error) return c.json(ERR(error.message, "D1Error"), 500);
	if (!result) return c.json(ERR("Email not found", "NotFound"), 404);
	return c.json(OK(result));
});

// @ts-ignore - OpenAPI route handler type mismatch with error response status codes
emailRoutes.openapi(deleteEmailRoute, async (c) => {
	const { emailId } = c.req.valid("param");
	const dbService = createDatabaseService(c.env.D1);
	const { meta, error } = await dbService.deleteEmailById(emailId);

	if (error) return c.json(ERR(error.message, "D1Error"), 500);
	if (meta && meta.changes === 0) return c.json(ERR("Email not found", "NotFound"), 404);
	return c.json(OK({ message: "Email deleted successfully" }));
});

emailRoutes.openapi(getDomainsRoute, async (c) => {
	c.header("Cache-Control", `public, max-age=${CACHE.DOMAINS_TTL}`);
	c.header("ETag", `"domains-${DOMAINS_SET.size}"`);
	return c.json(OK(Array.from(DOMAINS_SET)));
});

export default emailRoutes;
