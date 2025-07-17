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

emailRoutes.get(
	"/emails/:emailAddress",
	zValidator("param", emailAddressParamSchema),
	zValidator("query", emailQuerySchema),
	getEmails,
);

emailRoutes.delete(
	"/emails/:emailAddress",
	zValidator("param", emailAddressParamSchema),
	deleteEmailsByAddress,
);

emailRoutes.get("/inbox/:emailId", zValidator("param", emailIdParamSchema), getEmailById);

emailRoutes.delete("/inbox/:emailId", zValidator("param", emailIdParamSchema), deleteEmailById);

emailRoutes.get("/domains", getSupportedDomains);

export default emailRoutes;
