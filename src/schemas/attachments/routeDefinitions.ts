import { createRoute, z } from "@hono/zod-openapi";
import {
	domainErrorResponseSchema,
	notFoundErrorResponseSchema,
	validationErrorResponseSchema,
} from "../emails/responseSchemas";
import { attachmentSummarySchema } from "./schema";

// Attachment-specific response schemas
const attachmentListResponseSchema = z
	.object({
		success: z.literal(true),
		result: z.array(attachmentSummarySchema),
	})
	.openapi("AttachmentListResponse");

const attachmentDeleteResponseSchema = z
	.object({
		success: z.literal(true),
		result: z.object({
			message: z.string(),
		}),
	})
	.openapi("AttachmentDeleteResponse");

// GET /emails/{emailAddress}/attachments
export const getEmailAttachmentsRoute = createRoute({
	method: "get",
	path: "/emails/{emailAddress}/attachments",
	summary: "Get attachments for all emails of a recipient",
	description: "Retrieve a list of all attachments for emails sent to the specified email address.",
	tags: ["Attachments"],
	request: {
		params: z.object({
			emailAddress: z.string().email().openapi({
				description: "The recipient email address.",
				example: "user@example.com",
			}),
		}),
		query: z.object({
			limit: z.coerce.number().min(1).max(100).default(50).openapi({
				description: "Maximum number of attachments to return.",
				example: 10,
			}),
			offset: z.coerce.number().min(0).default(0).openapi({
				description: "Number of attachments to skip.",
				example: 0,
			}),
		}),
	},
	responses: {
		200: {
			content: {
				"application/json": {
					schema: attachmentListResponseSchema,
				},
			},
			description: "List of attachments retrieved successfully.",
		},
		404: {
			content: {
				"application/json": {
					schema: domainErrorResponseSchema,
				},
			},
			description: "Domain not supported.",
		},
	},
});

// GET /inbox/{emailId}/attachments
export const getAttachmentsRoute = createRoute({
	method: "get",
	path: "/inbox/{emailId}/attachments",
	summary: "Get attachments for a specific email",
	description: "Retrieve all attachments for a specific email by its ID.",
	tags: ["Attachments"],
	request: {
		params: z.object({
			emailId: z.string().openapi({
				description: "The unique identifier of the email.",
				example: "usm2sw0qfv9a5ku9z4xmh8og",
			}),
		}),
	},
	responses: {
		200: {
			content: {
				"application/json": {
					schema: attachmentListResponseSchema,
				},
			},
			description: "Attachments retrieved successfully.",
		},
		400: {
			content: {
				"application/json": {
					schema: validationErrorResponseSchema,
				},
			},
			description: "Invalid request parameters.",
		},
		404: {
			content: {
				"application/json": {
					schema: notFoundErrorResponseSchema,
				},
			},
			description: "Email not found.",
		},
	},
});

// GET /attachments/{attachmentId}
export const getAttachmentRoute = createRoute({
	method: "get",
	path: "/attachments/{attachmentId}",
	summary: "Download an attachment",
	description: "Download a specific attachment by its ID.",
	tags: ["Attachments"],
	request: {
		params: z.object({
			attachmentId: z.string().openapi({
				description: "The unique identifier of the attachment.",
				example: "att_usm2sw0qfv9a5ku9z4xmh8og",
			}),
		}),
	},
	responses: {
		200: {
			content: {
				"application/octet-stream": {
					schema: z.string().openapi({
						description: "The attachment file content.",
						format: "binary",
					}),
				},
			},
			description: "Attachment downloaded successfully.",
		},
		400: {
			content: {
				"application/json": {
					schema: validationErrorResponseSchema,
				},
			},
			description: "Invalid request parameters.",
		},
		404: {
			content: {
				"application/json": {
					schema: notFoundErrorResponseSchema,
				},
			},
			description: "Attachment not found.",
		},
	},
});

// DELETE /attachments/{attachmentId}
export const deleteAttachmentRoute = createRoute({
	method: "delete",
	path: "/attachments/{attachmentId}",
	summary: "Delete an attachment",
	description: "Delete a specific attachment by its ID.",
	tags: ["Attachments"],
	request: {
		params: z.object({
			attachmentId: z.string().openapi({
				description: "The unique identifier of the attachment.",
				example: "att_usm2sw0qfv9a5ku9z4xmh8og",
			}),
		}),
	},
	responses: {
		200: {
			content: {
				"application/json": {
					schema: attachmentDeleteResponseSchema,
				},
			},
			description: "Attachment deleted successfully.",
		},
		400: {
			content: {
				"application/json": {
					schema: validationErrorResponseSchema,
				},
			},
			description: "Invalid request parameters.",
		},
		404: {
			content: {
				"application/json": {
					schema: notFoundErrorResponseSchema,
				},
			},
			description: "Attachment not found.",
		},
	},
});
