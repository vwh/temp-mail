import { createId } from "@paralleldrive/cuid2";
import PostalMime from "postal-mime";

import * as db from "@/database/d1";
import { updateSenderStats } from "@/database/kv";
import { emailSchema } from "@/schemas/emails/schema";
import { now } from "@/utils/helpers";
import { processEmailContent } from "@/utils/mail";
import { PerformanceTimer } from "@/utils/performance";

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

		const emailData = emailSchema.parse({
			id: emailId,
			from_address: message.from,
			to_address: message.to,
			subject: email.subject || null,
			received_at: now(),
			html_content: htmlContent,
			text_content: textContent,
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

		timer.end(); // Log processing time
	} catch (error) {
		console.error("Failed to process email:", error);
		throw error;
	}
}
