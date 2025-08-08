import { OpenAPIHono } from "@hono/zod-openapi";
import * as db from "@/database/d1";
import * as r2 from "@/database/r2";
import validateDomain from "@/middlewares/validateDomain";
import {
	deleteAttachmentRoute,
	getAttachmentRoute,
	getAttachmentsRoute,
	getEmailAttachmentsRoute,
} from "@/schemas/attachments/routeDefinitions";
import { ERR, OK } from "@/utils/http";

const attachmentRoutes = new OpenAPIHono<{ Bindings: CloudflareBindings }>();

// Apply domain validation middleware to email-specific routes
attachmentRoutes.use("/emails/:emailAddress/attachments", validateDomain);

// GET /emails/{emailAddress}/attachments
// @ts-ignore - OpenAPI strict typing doesn't allow flexible error responses, but runtime behavior is correct
attachmentRoutes.openapi(getEmailAttachmentsRoute, async (c) => {
	const { emailAddress } = c.req.valid("param");
	const { limit, offset } = c.req.valid("query");

	// Get all emails for this address first
	const { results: emails, error: emailError } = await db.getEmailsByRecipient(
		c.env.D1,
		emailAddress,
		1000, // Get more emails to find attachments
		0,
	);

	if (emailError) return c.json(ERR(emailError.message, "ValidationError"), 400);

	// Get attachments for all emails
	const attachmentPromises = emails
		.filter((email) => email.has_attachments)
		.map((email) => db.getAttachmentsByEmailId(c.env.D1, email.id));

	const attachmentResults = await Promise.all(attachmentPromises);
	const allAttachments = attachmentResults
		.filter((result) => !result.error)
		.flatMap((result) => result.results)
		.sort((a, b) => b.created_at - a.created_at)
		.slice(offset, offset + limit);

	return c.json(OK(allAttachments));
});

// GET /inbox/{emailId}/attachments
// @ts-ignore - OpenAPI strict typing doesn't allow flexible error responses, but runtime behavior is correct
attachmentRoutes.openapi(getAttachmentsRoute, async (c) => {
	const { emailId } = c.req.valid("param");

	// Check if email exists
	const { result: email, error: emailError } = await db.getEmailById(c.env.D1, emailId);
	if (emailError) return c.json(ERR(emailError.message, "ValidationError"), 400);
	if (!email) return c.json(ERR("Email not found", "NotFound"), 404);

	// Get attachments for this email
	const { results, error } = await db.getAttachmentsByEmailId(c.env.D1, emailId);
	if (error) return c.json(ERR(error.message, "ValidationError"), 400);

	return c.json(OK(results));
});

// GET /attachments/{attachmentId}
// @ts-ignore - OpenAPI strict typing doesn't allow flexible error responses, but runtime behavior is correct
attachmentRoutes.openapi(getAttachmentRoute, async (c) => {
	const { attachmentId } = c.req.valid("param");

	// Get attachment metadata from database
	const { result: attachment, error: dbError } = await db.getAttachmentById(c.env.D1, attachmentId);
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

// DELETE /attachments/{attachmentId}
// @ts-ignore - OpenAPI strict typing doesn't allow flexible error responses, but runtime behavior is correct
attachmentRoutes.openapi(deleteAttachmentRoute, async (c) => {
	const { attachmentId } = c.req.valid("param");

	// Get attachment metadata from database
	const { result: attachment, error: dbError } = await db.getAttachmentById(c.env.D1, attachmentId);
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
	const { success: dbSuccess, error: dbDeleteError } = await db.deleteAttachmentById(
		c.env.D1,
		attachmentId,
	);
	if (!dbSuccess)
		return c.json(
			ERR(dbDeleteError?.message || "Failed to delete attachment", "ValidationError"),
			400,
		);

	// Update email attachment count
	const { results: remainingAttachments } = await db.getAttachmentsByEmailId(
		c.env.D1,
		attachment.email_id,
	);
	await db.updateEmailAttachmentInfo(
		c.env.D1,
		attachment.email_id,
		remainingAttachments.length > 0,
		remainingAttachments.length,
	);

	return c.json(OK({ message: "Attachment deleted successfully" }));
});

export default attachmentRoutes;
