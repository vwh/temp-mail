import { z } from "@hono/zod-openapi";

// Attachment schema
export const attachmentSchema = z
	.object({
		id: z.string().openapi({
			description: "The unique identifier for the attachment.",
			example: "att_usm2sw0qfv9a5ku9z4xmh8og",
		}),
		email_id: z.string().openapi({
			description: "The ID of the email this attachment belongs to.",
			example: "usm2sw0qfv9a5ku9z4xmh8og",
		}),
		filename: z.string().openapi({
			description: "The original filename of the attachment.",
			example: "document.pdf",
		}),
		content_type: z.string().openapi({
			description: "The MIME type of the attachment.",
			example: "application/pdf",
		}),
		size: z.number().openapi({
			description: "The size of the attachment in bytes.",
			example: 1024000,
		}),
		r2_key: z.string().openapi({
			description: "The R2 storage key for the attachment.",
			example: "attachments/usm2sw0qfv9a5ku9z4xmh8og/att_usm2sw0qfv9a5ku9z4xmh8og",
		}),
		created_at: z.number().openapi({
			description: "The timestamp when the attachment was created (Unix epoch).",
			example: 1753317948,
		}),
	})
	.openapi("Attachment");

export type Attachment = z.infer<typeof attachmentSchema>;

// Attachment summary schema (without R2 key for security)
export const attachmentSummarySchema = z
	.object({
		id: z.string().openapi({
			description: "The unique identifier for the attachment.",
			example: "att_usm2sw0qfv9a5ku9z4xmh8og",
		}),
		filename: z.string().openapi({
			description: "The original filename of the attachment.",
			example: "document.pdf",
		}),
		content_type: z.string().openapi({
			description: "The MIME type of the attachment.",
			example: "application/pdf",
		}),
		size: z.number().openapi({
			description: "The size of the attachment in bytes.",
			example: 1024000,
		}),
		created_at: z.number().openapi({
			description: "The timestamp when the attachment was created (Unix epoch).",
			example: 1753317948,
		}),
	})
	.openapi("AttachmentSummary");

export type AttachmentSummary = z.infer<typeof attachmentSummarySchema>;
