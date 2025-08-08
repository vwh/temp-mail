import { z } from "@hono/zod-openapi";

// Email object schema
export const emailSchema = z
	.object({
		id: z.string().openapi({
			description: "The unique identifier for the email.",
			example: "usm2sw0qfv9a5ku9z4xmh8og",
		}),
		from_address: z.string().openapi({
			description: "The sender's email address.",
			example: "sender@example.com",
		}),
		to_address: z.string().openapi({
			description: "The recipient's email address.",
			example: "recipient@barid.site",
		}),
		subject: z.string().nullable().openapi({
			description: "The subject of the email.",
			example: "Welcome to our service",
		}),
		received_at: z.number().openapi({
			description: "The timestamp when the email was received (Unix epoch).",
			example: 1753317948,
		}),
		html_content: z.string().nullable().openapi({
			description: "The HTML content of the email.",
			example: "<p>Hello world</p>",
		}),
		text_content: z.string().nullable().openapi({
			description: "The plain text content of the email.",
			example: "Hello world",
		}),
		has_attachments: z.boolean().default(false).openapi({
			description: "Whether the email has attachments.",
			example: true,
		}),
		attachment_count: z.number().default(0).openapi({
			description: "The number of attachments in the email.",
			example: 2,
		}),
	})
	.openapi("Email");

export type Email = z.infer<typeof emailSchema>;

// Email summary schema
const emailSummarySchema = z
	.object({
		id: z.string().openapi({
			description: "The unique identifier for the email.",
			example: "usm2sw0qfv9a5ku9z4xmh8og",
		}),
		from_address: z.string().openapi({
			description: "The sender's email address.",
			example: "sender@example.com",
		}),
		to_address: z.string().openapi({
			description: "The recipient's email address.",
			example: "recipient@barid.site",
		}),
		subject: z.string().nullable().openapi({
			description: "The subject of the email.",
			example: "Welcome to our service",
		}),
		received_at: z.number().openapi({
			description: "The timestamp when the email was received (Unix epoch).",
			example: 1753317948,
		}),
		has_attachments: z.boolean().default(false).openapi({
			description: "Whether the email has attachments.",
			example: true,
		}),
		attachment_count: z.number().default(0).openapi({
			description: "The number of attachments in the email.",
			example: 2,
		}),
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
