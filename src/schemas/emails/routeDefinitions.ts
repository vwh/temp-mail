import { createRoute } from "@hono/zod-openapi";
import {
	domainErrorResponseSchema,
	domainsSuccessResponseSchema,
	emailDeleteSuccessResponseSchema,
	emailDetailSuccessResponseSchema,
	emailListSuccessResponseSchema,
	emailsCountSuccessResponseSchema,
	emailsDeleteSuccessResponseSchema,
	notFoundErrorResponseSchema,
	validationErrorResponseSchema,
} from "./responseSchemas";
import { emailAddressParamSchema, emailIdParamSchema, emailQuerySchema } from "./routerSchema";

// Get emails route
export const getEmailsRoute = createRoute({
	method: "get",
	path: "/emails/{emailAddress}",
	request: {
		params: emailAddressParamSchema,
		query: emailQuerySchema,
	},
	responses: {
		200: {
			content: {
				"application/json": {
					schema: emailListSuccessResponseSchema,
				},
			},
			description: "Successfully retrieved emails for the specified address",
		},
		404: {
			content: {
				"application/json": {
					schema: domainErrorResponseSchema,
				},
			},
			description: "Domain not supported - returns list of supported domains",
		},
		400: {
			content: {
				"application/json": {
					schema: validationErrorResponseSchema,
				},
			},
			description: "Validation error - invalid email format",
		},
	},
	tags: ["Emails"],
	summary: "Get emails",
	description: "Retrieve all emails for a specific email address with pagination.",
});

// Get emails count route
export const getEmailsCountRoute = createRoute({
	method: "get",
	path: "/emails/count/{emailAddress}",
	request: {
		params: emailAddressParamSchema,
	},
	responses: {
		200: {
			content: {
				"application/json": {
					schema: emailsCountSuccessResponseSchema,
				},
			},
			description: "Successfully retrieved the count of emails for the specified address",
		},
		404: {
			content: {
				"application/json": {
					schema: domainErrorResponseSchema,
				},
			},
			description: "Domain not supported - returns list of supported domains",
		},
		400: {
			content: {
				"application/json": {
					schema: validationErrorResponseSchema,
				},
			},
			description: "Validation error - invalid email format",
		},
	},
	tags: ["Emails"],
	summary: "Get email count",
	description: "Retrieve the total number of emails for a specific email address.",
});

// Delete emails route
export const deleteEmailsRoute = createRoute({
	method: "delete",
	path: "/emails/{emailAddress}",
	request: {
		params: emailAddressParamSchema,
	},
	responses: {
		200: {
			content: {
				"application/json": {
					schema: emailsDeleteSuccessResponseSchema,
				},
			},
			description: "Successfully deleted all emails for the address",
		},
		400: {
			content: {
				"application/json": {
					schema: validationErrorResponseSchema,
				},
			},
			description: "Validation error - invalid email format",
		},
	},
	tags: ["Emails"],
	summary: "Delete all emails",
	description: "Delete all emails associated with the specified email address",
});

// Get single email route
export const getEmailRoute = createRoute({
	method: "get",
	path: "/inbox/{emailId}",
	request: {
		params: emailIdParamSchema,
	},
	responses: {
		200: {
			content: {
				"application/json": {
					schema: emailDetailSuccessResponseSchema,
				},
			},
			description: "Successfully retrieved email details",
		},
		404: {
			content: {
				"application/json": {
					schema: notFoundErrorResponseSchema,
				},
			},
			description: "Email not found",
		},
		400: {
			content: {
				"application/json": {
					schema: validationErrorResponseSchema,
				},
			},
			description: "Validation error - invalid email ID format",
		},
	},
	tags: ["Inbox"],
	summary: "Get email inbox",
	description: "Retrieve full email content including HTML and text by email ID",
});

// Delete single email route
export const deleteEmailRoute = createRoute({
	method: "delete",
	path: "/inbox/{emailId}",
	request: {
		params: emailIdParamSchema,
	},
	responses: {
		200: {
			content: {
				"application/json": {
					schema: emailDeleteSuccessResponseSchema,
				},
			},
			description: "Successfully deleted the email",
		},
		404: {
			content: {
				"application/json": {
					schema: notFoundErrorResponseSchema,
				},
			},
			description: "Email not found",
		},
		400: {
			content: {
				"application/json": {
					schema: validationErrorResponseSchema,
				},
			},
			description: "Validation error - invalid email ID format",
		},
	},
	tags: ["Inbox"],
	summary: "Delete email inbox",
	description: "Delete a specific inbox by its email ID",
});

// Get domains route
export const getDomainsRoute = createRoute({
	method: "get",
	path: "/domains",
	responses: {
		200: {
			content: {
				"application/json": {
					schema: domainsSuccessResponseSchema,
				},
			},
			description: "List of all supported email domains",
		},
	},
	tags: ["Domains"],
	summary: "Get supported domains",
	description: "Retrieve a list of all supported email domains",
});
