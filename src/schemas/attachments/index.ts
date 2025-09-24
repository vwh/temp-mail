import { z } from "@hono/zod-openapi";

// Attachment schemas
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

// Parameter schemas
export const attachmentIdParamSchema = z.object({
	attachmentId: z
		.string()
		.cuid2()
		.openapi({
			param: {
				name: "attachmentId",
				in: "path",
			},
			example: "att_usm2sw0qfv9a5ku9z4xmh8og",
			description: "The unique identifier for the attachment.",
		}),
});

// Response schemas
export const attachmentSuccessResponseSchema = z
	.object({
		success: z.literal(true).openapi({
			description: "Indicates that the request was successful.",
			example: true,
		}),
		result: attachmentSchema,
	})
	.openapi("AttachmentSuccessResponse");

export const attachmentsSuccessResponseSchema = z
	.object({
		success: z.literal(true).openapi({
			description: "Indicates that the request was successful.",
			example: true,
		}),
		result: z.array(attachmentSchema),
	})
	.openapi("AttachmentsSuccessResponse");

export const attachmentDeleteSuccessResponseSchema = z
	.object({
		success: z.literal(true).openapi({
			description: "Indicates that the request was successful.",
			example: true,
		}),
		result: z.object({
			message: z.literal("Attachment deleted successfully").openapi({
				description: "A message indicating that the attachment was deleted.",
				example: "Attachment deleted successfully",
			}),
		}),
	})
	.openapi("AttachmentDeleteSuccessResponse");

export const attachmentNotFoundErrorResponseSchema = z
	.object({
		success: z.literal(false).openapi({
			description: "Indicates that the request failed because the attachment was not found.",
			example: false,
		}),
		error: z.object({
			name: z.literal("NotFound").openapi({
				description: "The name of the error.",
				example: "NotFound",
			}),
			message: z.literal("Attachment not found").openapi({
				description: "The error message.",
				example: "Attachment not found",
			}),
		}),
	})
	.openapi("AttachmentNotFoundErrorResponse");

// Type exports
export type Attachment = z.infer<typeof attachmentSchema>;
export type AttachmentSummary = z.infer<typeof attachmentSummarySchema>;
