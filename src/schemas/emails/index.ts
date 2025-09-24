import { z } from "@hono/zod-openapi";
import { DOMAINS_SET } from "@/config/domains";

// Parameter schemas
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
			description: "The email address to query for.",
		}),
});

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
			description: "The unique identifier for the email.",
		}),
});

// Query schemas
export const emailQuerySchema = z.object({
	limit: z.coerce.number().min(1).max(100).optional().default(10).openapi({
		example: 20,
		description: "The maximum number of emails to return.",
	}),
	offset: z.coerce.number().min(0).optional().default(0).openapi({
		example: 0,
		description: "The number of emails to skip before starting to return results.",
	}),
});

// Email object schemas
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

export const emailSummarySchema = z
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

// Response schemas
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

export const emailListSuccessResponseSchema = z
	.object({
		success: z.literal(true).openapi({
			description: "Indicates that the request was successful.",
			example: true,
		}),
		result: z.array(emailSummarySchema),
	})
	.openapi("EmailListSuccessResponse");

export const emailDetailSuccessResponseSchema = z
	.object({
		success: z.literal(true).openapi({
			description: "Indicates that the request was successful.",
			example: true,
		}),
		result: emailSchema,
	})
	.openapi("EmailDetailSuccessResponse");

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

// Type exports
export type Email = z.infer<typeof emailSchema>;
export type EmailSummary = z.infer<typeof emailSummarySchema>;
