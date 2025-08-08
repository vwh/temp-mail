import { createId } from "@paralleldrive/cuid2";
import PostalMime from "postal-mime";
import { ATTACHMENT_LIMITS } from "@/config/constants";
import * as db from "@/database/d1";
import { updateSenderStats } from "@/database/kv";
import * as r2 from "@/database/r2";
import { emailSchema } from "@/schemas/emails/schema";
import { now } from "@/utils/helpers";
import { processEmailContent } from "@/utils/mail";
import { PerformanceTimer } from "@/utils/performance";

// Type for PostalMime attachments
interface EmailAttachment {
	filename: string | null;
	mimeType?: string;
	content?: string | ArrayBuffer;
}

/**
 * Validate and filter email attachments
 */
function validateAttachments(attachments: EmailAttachment[], emailId: string): EmailAttachment[] {
	const validAttachments = [];
	let totalAttachmentSize = 0;

	for (const attachment of attachments) {
		// Skip attachments without filename
		if (!attachment.filename) {
			console.warn(`Email ${emailId}: Attachment without filename, skipping`);
			continue;
		}

		if (validAttachments.length >= ATTACHMENT_LIMITS.MAX_COUNT_PER_EMAIL) {
			console.warn(`Email ${emailId}: Too many attachments, skipping remaining`);
			break;
		}

		const attachmentSize =
			attachment.content instanceof ArrayBuffer
				? attachment.content.byteLength
				: new TextEncoder().encode(attachment.content || "").byteLength;

		// Check file type
		const contentType = attachment.mimeType || "application/octet-stream";
		if (
			!ATTACHMENT_LIMITS.ALLOWED_TYPES.includes(
				contentType as (typeof ATTACHMENT_LIMITS.ALLOWED_TYPES)[number],
			)
		) {
			console.warn(
				`Email ${emailId}: Attachment ${attachment.filename} has unsupported type (${contentType}), skipping`,
			);
			continue;
		}

		if (attachmentSize > ATTACHMENT_LIMITS.MAX_SIZE) {
			console.warn(
				`Email ${emailId}: Attachment ${attachment.filename} too large (${attachmentSize} bytes), skipping`,
			);
			continue;
		}

		totalAttachmentSize += attachmentSize;
		if (totalAttachmentSize > ATTACHMENT_LIMITS.MAX_SIZE * ATTACHMENT_LIMITS.MAX_COUNT_PER_EMAIL) {
			console.warn(
				`Email ${emailId}: Total attachment size too large, skipping remaining attachments`,
			);
			break;
		}

		validAttachments.push(attachment);
	}

	return validAttachments;
}

/**
 * Cloudflare email router handler - optimized version
 */
export async function handleEmail(
	message: ForwardableEmailMessage,
	env: CloudflareBindings,
	ctx: ExecutionContext,
) {
	try {
		const timer = new PerformanceTimer("email-processing");
		const emailId = createId();
		const email = await PostalMime.parse(message.raw);

		// Process email content
		const { htmlContent, textContent } = processEmailContent(
			email.html ?? null,
			email.text ?? null,
		);

		// Process attachments
		const attachments = email.attachments || [];
		const validAttachments = validateAttachments(attachments, emailId);

		const emailData = emailSchema.parse({
			id: emailId,
			from_address: message.from,
			to_address: message.to,
			subject: email.subject || null,
			received_at: now(),
			html_content: htmlContent,
			text_content: textContent,
			has_attachments: validAttachments.length > 0,
			attachment_count: validAttachments.length,
		});

		// Update sender stats
		ctx.waitUntil(
			updateSenderStats(env.KV, message.from).catch((error) => {
				console.error("Failed to update sender stats:", error);
			}),
		);

		// Insert email
		const { success, error } = await db.insertEmail(env.D1, emailData);

		if (!success) {
			throw new Error(`Failed to insert email: ${error}`);
		}

		// Process and store attachments
		if (validAttachments.length > 0) {
			ctx.waitUntil(processAttachments(env, emailId, validAttachments as EmailAttachment[]));
		}

		timer.end(); // Log processing time
	} catch (error) {
		console.error("Failed to process email:", error);
		throw error;
	}
}

/**
 * Process a single attachment
 */
async function processSingleAttachment(
	env: CloudflareBindings,
	emailId: string,
	attachment: EmailAttachment,
): Promise<void> {
	// Skip attachments without filename
	if (!attachment.filename) {
		console.warn(`Skipping attachment without filename in email ${emailId}`);
		return;
	}

	const attachmentId = createId();
	const attachmentSize =
		attachment.content instanceof ArrayBuffer
			? attachment.content.byteLength
			: new TextEncoder().encode(attachment.content || "").byteLength;

	// Convert content to ArrayBuffer if needed
	const content =
		attachment.content instanceof ArrayBuffer
			? attachment.content
			: (new TextEncoder().encode(attachment.content || "").buffer as ArrayBuffer);

	// Generate R2 key
	const r2Key = r2.generateR2Key(emailId, attachmentId, attachment.filename);

	// Store in R2
	const { success: r2Success, error: r2Error } = await r2.storeAttachment(
		env.R2,
		r2Key,
		content,
		attachment.mimeType || "application/octet-stream",
		attachment.filename,
	);

	if (!r2Success) {
		console.error(`Failed to store attachment ${attachment.filename}:`, r2Error);
		return;
	}

	// Store metadata in database
	const attachmentData = {
		id: attachmentId,
		email_id: emailId,
		filename: attachment.filename,
		content_type: attachment.mimeType || "application/octet-stream",
		size: attachmentSize,
		r2_key: r2Key,
		created_at: now(),
	};

	const { success: dbSuccess, error: dbError } = await db.insertAttachment(env.D1, attachmentData);
	if (!dbSuccess) {
		console.error(`Failed to store attachment metadata for ${attachment.filename}:`, dbError);
		// Try to clean up R2 object
		await r2.deleteAttachment(env.R2, r2Key);
	}
}

/**
 * Process and store email attachments
 */
async function processAttachments(
	env: CloudflareBindings,
	emailId: string,
	attachments: EmailAttachment[],
) {
	try {
		for (const attachment of attachments) {
			await processSingleAttachment(env, emailId, attachment);
		}
	} catch (error) {
		console.error("Failed to process attachments:", error);
	}
}
