import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
	deleteEmailById,
	deleteEmailsByAddress,
	getEmailById,
	getEmails,
	getSupportedDomains,
} from "@/controllers/emailController";
import {
	emailAddressParamSchema,
	emailIdParamSchema,
	emailQuerySchema,
} from "@/schemas/emailRouterSchema";

const emailRoutes = new Hono<{ Bindings: CloudflareBindings }>();

// GET /emails | Show all emails for a specific email address
emailRoutes.get(
	"/emails/:emailAddress",
	zValidator("param", emailAddressParamSchema),
	zValidator("query", emailQuerySchema),
	getEmails,
);

// DELETE /emails | Delete all emails for a specific email address
emailRoutes.delete(
	"/emails/:emailAddress",
	zValidator("param", emailAddressParamSchema),
	deleteEmailsByAddress,
);

// GET /inbox/:emailId | Show a specific email inbox
emailRoutes.get("/inbox/:emailId", zValidator("param", emailIdParamSchema), getEmailById);

// DELETE /inbox/:emailId | Delete a specific email inbox
emailRoutes.delete("/inbox/:emailId", zValidator("param", emailIdParamSchema), deleteEmailById);

// GET /domains | Show a list of supported email domains
emailRoutes.get("/domains", getSupportedDomains);

export default emailRoutes;
