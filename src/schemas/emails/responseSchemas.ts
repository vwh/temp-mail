import { z } from "@hono/zod-openapi";
import { DOMAINS_SET } from "@/config/domains";
import { emailSchema } from "./schema";

// Generic success response schema
export const successResponseSchema = z
	.object({
		status: z.boolean(),
		result: z.any(),
	})
	.openapi("SuccessResponse");

// Generic error response schema
export const errorResponseSchema = z
	.object({
		status: z.boolean(),
		error: z.object({
			name: z.string(),
			message: z.string(),
		}),
		note: z.any().optional(),
	})
	.openapi("ErrorResponse");

// Validation error response schema
export const validationErrorResponseSchema = z
	.object({
		success: z.literal(false),
		error: z.object({
			name: z.string(),
			message: z.string(),
		}),
	})
	.openapi("ValidationErrorResponse");

// Email list success response schema
export const emailListSuccessResponseSchema = z
	.object({
		status: z.literal(true),
		result: z.array(
			z.object({
				id: z.string().openapi({ example: "usm2sw0qfv9a5ku9z4xmh8og" }),
				from_address: z.string().openapi({ example: "sender@example.com" }),
				to_address: z.string().openapi({ example: "recipient@example.sh" }),
				subject: z.string().openapi({ example: "asdasd" }),
				received_at: z.number().openapi({ example: 1753317948 }),
			}),
		),
	})
	.openapi("EmailListSuccessResponse");

// Email detail success response schema
export const emailDetailSuccessResponseSchema = z
	.object({
		status: z.literal(true),
		result: emailSchema,
	})
	.openapi("EmailDetailSuccessResponse");

// Delete success response schema
export const deleteSuccessResponseSchema = z
	.object({
		status: z.literal(true),
		result: z.object({
			message: z.string(),
		}),
	})
	.openapi("DeleteSuccessResponse");

// Domains success response schema
export const domainsSuccessResponseSchema = z
	.object({
		status: z.literal(true),
		result: z.array(z.string()).openapi({
			example: Array.from(DOMAINS_SET),
		}),
	})
	.openapi("DomainsSuccessResponse");

// Domain error response schema with required note
export const domainErrorResponseSchema = z
	.object({
		status: z.literal(false),
		error: z.object({
			name: z.literal("DomainError"),
			message: z.literal("Domain not supported"),
		}),
		note: z.object({
			supportedDomains: z.array(z.string()),
		}),
	})
	.openapi("DomainErrorResponse");

// Not found error response schema
export const notFoundErrorResponseSchema = z
	.object({
		status: z.literal(false),
		error: z.object({
			name: z.literal("Error"),
			message: z.literal("Email not found"),
		}),
	})
	.openapi("NotFoundErrorResponse");
