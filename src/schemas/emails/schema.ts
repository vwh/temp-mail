import { z } from "@hono/zod-openapi";

// Email object schema
export const emailSchema = z
	.object({
		id: z.string().openapi({ example: "usm2sw0qfv9a5ku9z4xmh8og" }),
		from_address: z.string().openapi({ example: "sender@example.com" }),
		to_address: z.string().openapi({ example: "recipient@barid.site" }),
		subject: z.string().nullable().openapi({ example: "Welcome to our service" }),
		received_at: z.number().openapi({ example: 1753317948 }),
		html_content: z.string().nullable().openapi({ example: "<p>Hello world</p>" }),
		text_content: z.string().nullable().openapi({ example: "Hello world" }),
	})
	.openapi("Email");

export type Email = z.infer<typeof emailSchema>;

// Email summary schema
const emailSummarySchema = z
	.object({
		id: z.string().openapi({ example: "usm2sw0qfv9a5ku9z4xmh8og" }),
		from_address: z.string().openapi({ example: "sender@example.com" }),
		to_address: z.string().openapi({ example: "recipient@barid.site" }),
		subject: z.string().nullable().openapi({ example: "Welcome to our service" }),
		received_at: z.number().openapi({ example: 1753317948 }),
	})
	.openapi("EmailSummary");

export type EmailSummary = z.infer<typeof emailSummarySchema>;

// Response schemas
export const emailListResponseSchema = z.array(emailSummarySchema).openapi("EmailListResponse");
export const domainsResponseSchema = z.array(z.string()).openapi("DomainsResponse");
export const successResponseSchema = z
	.object({
		message: z.string(),
	})
	.openapi("SuccessResponse");
