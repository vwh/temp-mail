import { z } from "@hono/zod-openapi";
import { DOMAINS_SET } from "@/config/domains";
import { emailSchema } from "./schema";

// Generic success response schema
export const successResponseSchema = z
	.object({
		success: z.boolean().openapi({
			description: "Indicates if the request was successful.",
			example: true,
		}),
		result: z.any().openapi({
			description: "The result of the request.",
		}),
	})
	.openapi("SuccessResponse");

// Generic error response schema
export const errorResponseSchema = z
	.object({
		success: z.boolean().openapi({
			description: "Indicates if the request was successful.",
			example: false,
		}),
		error: z.object({
			name: z.string().openapi({
				description: "The name of the error.",
				example: "Error",
			}),
			message: z.string().openapi({
				description: "The error message.",
				example: "An error occurred.",
			}),
		}),
		note: z.any().optional().openapi({
			description: "Additional notes about the error.",
		}),
	})
	.openapi("ErrorResponse");

// Validation error response schema
export const validationErrorResponseSchema = z
	.object({
		success: z.literal(false).openapi({
			description: "Indicates that the request failed due to a validation error.",
			example: false,
		}),
		error: z.object({
			name: z.string().openapi({
				description: "The name of the error.",
				example: "ZodError",
			}),
			message: z.string().openapi({
				description: "The validation error message.",
				example: "Invalid input.",
			}),
		}),
	})
	.openapi("ValidationErrorResponse");

// Email list success response schema
export const emailListSuccessResponseSchema = z
	.object({
		success: z.literal(true).openapi({
			description: "Indicates that the request was successful.",
			example: true,
		}),
		result: z.array(
			z.object({
				id: z.string().openapi({
					description: "The ID of the email.",
					example: "usm2sw0qfv9a5ku9z4xmh8og",
				}),
				from_address: z.string().openapi({
					description: "The email address of the sender.",
					example: "sender@example.com",
				}),
				to_address: z.string().openapi({
					description: "The email address of the recipient.",
					example: "recipient@example.sh",
				}),
				subject: z.string().openapi({
					description: "The subject of the email.",
					example: "Hello World",
				}),
				received_at: z.number().openapi({
					description: "The timestamp when the email was received.",
					example: 1753317948,
				}),
			}),
		),
	})
	.openapi("EmailListSuccessResponse");

// Email detail success response schema
export const emailDetailSuccessResponseSchema = z
	.object({
		success: z.literal(true).openapi({
			description: "Indicates that the request was successful.",
			example: true,
		}),
		result: emailSchema,
	})
	.openapi("EmailDetailSuccessResponse");

// Delete emails success response schema
export const emailsDeleteSuccessResponseSchema = z
	.object({
		success: z.literal(true).openapi({
			description: "Indicates that the request was successful.",
			example: true,
		}),
		result: z.object({
			message: z.literal("Emails deleted successfully").openapi({
				description: "A message indicating that the emails were deleted.",
				example: "Emails deleted successfully",
			}),
			deleted_count: z.number().openapi({
				description: "The number of emails deleted.",
				example: 2,
			}),
		}),
	})
	.openapi("DeleteEmailsSuccessResponse");

// Delete email success response schema
export const emailDeleteSuccessResponseSchema = z
	.object({
		success: z.literal(true).openapi({
			description: "Indicates that the request was successful.",
			example: true,
		}),
		result: z.object({
			message: z.literal("Email deleted successfully").openapi({
				description: "A message indicating that the email was deleted.",
				example: "Email deleted successfully",
			}),
		}),
	})
	.openapi("DeleteEmailSuccessResponse");

// Domains success response schema
export const domainsSuccessResponseSchema = z
	.object({
		success: z.literal(true).openapi({
			description: "Indicates that the request was successful.",
			example: true,
		}),
		result: z.array(z.string()).openapi({
			description: "A list of supported domains.",
			example: Array.from(DOMAINS_SET),
		}),
	})
	.openapi("DomainsSuccessResponse");

// Domain error response schema with required note
export const domainErrorResponseSchema = z
	.object({
		success: z.literal(false).openapi({
			description: "Indicates that the request failed due to a domain error.",
			example: false,
		}),
		error: z.object({
			name: z.literal("DomainError").openapi({
				description: "The name of the error.",
				example: "DomainError",
			}),
			message: z.literal("Domain not supported").openapi({
				description: "The error message.",
				example: "Domain not supported",
			}),
		}),
		note: z.object({
			supported_domains: z.array(z.string()).openapi({
				description: "A list of supported domains.",
				example: Array.from(DOMAINS_SET),
			}),
		}),
	})
	.openapi("DomainErrorResponse");

// Not found error response schema
export const notFoundErrorResponseSchema = z
	.object({
		success: z.literal(false).openapi({
			description: "Indicates that the request failed because the email was not found.",
			example: false,
		}),
		error: z.object({
			name: z.literal("NotFound").openapi({
				description: "The name of the error.",
				example: "NotFound",
			}),
			message: z.literal("Email not found").openapi({
				description: "The error message.",
				example: "Email not found",
			}),
		}),
	})
	.openapi("NotFoundErrorResponse");

// Emails count success response schema
export const emailsCountSuccessResponseSchema = z
	.object({
		success: z.literal(true).openapi({
			description: "Indicates that the request was successful.",
			example: true,
		}),
		result: z.object({
			count: z.number().openapi({
				description: "The number of emails for the specified address.",
				example: 5,
			}),
		}),
	})
	.openapi("EmailsCountSuccessResponse");
