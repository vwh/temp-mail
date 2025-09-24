// External imports
import { OpenAPIHono } from "@hono/zod-openapi";

// Database imports
import { createDatabaseService } from "@/database";
import * as r2 from "@/database/r2";

// Schema imports
import {
	deleteAttachmentRoute,
	getAttachmentRoute,
	getAttachmentsRoute,
	getEmailAttachmentsRoute,
} from "@/schemas/attachments/routeDefinitions";

// Utility imports
import { ERR, OK } from "@/utils/http";
import { validateEmailDomain } from "@/utils/validation";

const attachmentRoutes = new OpenAPIHono<{ Bindings: CloudflareBindings }>();

// @ts-ignore - OpenAPI route handler type mismatch with error response status codes
attachmentRoutes.openapi(getEmailAttachmentsRoute, async (c) => {
	const { emailAddress } = c.req.valid("param");
	const { limit, offset } = c.req.valid("query");

	// Validate domain after Zod validation
	const domainValidation = validateEmailDomain(emailAddress);
	if (!domainValidation.valid) return c.json(domainValidation.error, 404);

	// Get emails with attachments
	const dbService = createDatabaseService(c.env.D1);
	const { results: allAttachments, error: queryError } = await dbService.getEmailsWithAttachments(
		emailAddress,
		1000, // Get more emails to find attachments
		0,
	);

	if (queryError) return c.json(ERR(queryError.message, "ValidationError"), 400);

	// Sort by created_at and apply pagination
	const sortedAttachments = allAttachments
		.sort((a, b) => b.created_at - a.created_at)
		.slice(offset, offset + limit);

	return c.json(OK(sortedAttachments));
});

// @ts-ignore - OpenAPI route handler type mismatch with error response status codes
attachmentRoutes.openapi(getAttachmentsRoute, async (c) => {
	const { emailId } = c.req.valid("param");

	// Check if email exists
	const dbService = createDatabaseService(c.env.D1);
	const { result: email, error: emailError } = await dbService.getEmailById(emailId);
	if (emailError) return c.json(ERR(emailError.message, "ValidationError"), 400);
	if (!email) return c.json(ERR("Email not found", "NotFound"), 404);

	// Get attachments for this email
	const { results, error } = await dbService.getAttachmentsByEmailId(emailId);
	if (error) return c.json(ERR(error.message, "ValidationError"), 400);

	return c.json(OK(results));
});

// @ts-ignore - OpenAPI route handler type mismatch with error response status codes
attachmentRoutes.openapi(getAttachmentRoute, async (c) => {
	const { attachmentId } = c.req.valid("param");

	// Get attachment metadata from database
	const dbService = createDatabaseService(c.env.D1);
	const { result: attachment, error: dbError } = await dbService.getAttachmentById(attachmentId);
	if (dbError) return c.json(ERR(dbError.message, "ValidationError"), 400);
	if (!attachment) return c.json(ERR("Attachment not found", "NotFound"), 404);

	// Get attachment data from R2
	const { success, data, error: r2Error } = await r2.getAttachment(c.env.R2, attachment.r2_key);
	if (!success || !data) {
		return c.json(ERR(r2Error?.message || "Failed to retrieve attachment", "NotFound"), 404);
	}

	// Set appropriate headers
	c.header("Content-Type", attachment.content_type);
	c.header("Content-Disposition", `attachment; filename="${attachment.filename}"`);
	c.header("Content-Length", attachment.size.toString());

	return c.body(data.body);
});

// @ts-ignore - OpenAPI route handler type mismatch with error response status codes
attachmentRoutes.openapi(deleteAttachmentRoute, async (c) => {
	const { attachmentId } = c.req.valid("param");

	// Get attachment metadata from database
	const dbService = createDatabaseService(c.env.D1);
	const { result: attachment, error: dbError } = await dbService.getAttachmentById(attachmentId);
	if (dbError) return c.json(ERR(dbError.message, "ValidationError"), 400);
	if (!attachment) return c.json(ERR("Attachment not found", "NotFound"), 404);

	// Delete from R2
	const { success: r2Success, error: r2Error } = await r2.deleteAttachment(
		c.env.R2,
		attachment.r2_key,
	);
	if (!r2Success) {
		console.error("Failed to delete attachment from R2:", r2Error);
		// Continue with database deletion even if R2 deletion fails
	}

	// Delete from database
	const { success: dbSuccess, error: dbDeleteError } =
		await dbService.deleteAttachmentById(attachmentId);
	if (!dbSuccess)
		return c.json(
			ERR(dbDeleteError?.message || "Failed to delete attachment", "ValidationError"),
			400,
		);

	// Update email attachment count
	const { results: remainingAttachments } = await dbService.getAttachmentsByEmailId(
		attachment.email_id,
	);
	await dbService.updateEmailAttachmentInfo(
		attachment.email_id,
		remainingAttachments.length > 0,
		remainingAttachments.length,
	);

	return c.json(OK({ message: "Attachment deleted successfully" }));
});

export default attachmentRoutes;
