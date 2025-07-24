import { z } from "@hono/zod-openapi";

// Email address parameter schema
export const emailAddressParamSchema = z.object({
	emailAddress: z
		.string()
		.email()
		.openapi({
			param: {
				name: "emailAddress",
				in: "path",
			},
			example: "user@example.com",
			description: "Email address to query",
		}),
});

// Email ID parameter schema
export const emailIdParamSchema = z.object({
	emailId: z
		.string()
		.cuid2()
		.openapi({
			param: {
				name: "emailId",
				in: "path",
			},
			example: "usm2sw0qfv9a5ku9z4xmh8og",
			description: "Unique email identifier",
		}),
});

// Email query schema
export const emailQuerySchema = z.object({
	limit: z.coerce.number().min(1).max(100).optional().default(10).openapi({
		example: 20,
		description: "Number of emails to return",
	}),
	offset: z.coerce.number().min(0).optional().default(0).openapi({
		example: 0,
		description: "Number of emails to skip",
	}),
});
