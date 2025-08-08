import { ATTACHMENT_LIMITS } from "@/config/constants";

/**
 * Generate R2 key for attachment storage
 */
export function generateR2Key(emailId: string, attachmentId: string, filename: string): string {
	// Clean filename to be R2-safe
	const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
	return `attachments/${emailId}/${attachmentId}/${cleanFilename}`;
}

/**
 * Store attachment in R2
 */
export async function storeAttachment(
	r2: R2Bucket,
	key: string,
	data: ArrayBuffer,
	contentType: string,
	filename: string,
): Promise<{ success: boolean; error?: Error }> {
	try {
		// Check file size
		if (data.byteLength > ATTACHMENT_LIMITS.MAX_SIZE) {
			return {
				success: false,
				error: new Error(
					`File size ${data.byteLength} exceeds maximum allowed size of ${ATTACHMENT_LIMITS.MAX_SIZE} bytes`,
				),
			};
		}

		// Check content type
		if (
			!ATTACHMENT_LIMITS.ALLOWED_TYPES.includes(
				contentType as (typeof ATTACHMENT_LIMITS.ALLOWED_TYPES)[number],
			)
		) {
			return {
				success: false,
				error: new Error(`Content type ${contentType} is not allowed`),
			};
		}

		await r2.put(key, data, {
			httpMetadata: {
				contentType,
				contentDisposition: `attachment; filename="${filename}"`,
			},
			customMetadata: {
				originalFilename: filename,
				uploadedAt: Date.now().toString(),
			},
		});

		return { success: true };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error : new Error(String(error)),
		};
	}
}

/**
 * Get attachment from R2
 */
export async function getAttachment(
	r2: R2Bucket,
	key: string,
): Promise<{ success: boolean; data?: R2ObjectBody; error?: Error }> {
	try {
		const object = await r2.get(key);

		if (!object) {
			return {
				success: false,
				error: new Error("Attachment not found"),
			};
		}

		return { success: true, data: object };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error : new Error(String(error)),
		};
	}
}

/**
 * Delete attachment from R2
 */
export async function deleteAttachment(
	r2: R2Bucket,
	key: string,
): Promise<{ success: boolean; error?: Error }> {
	try {
		await r2.delete(key);
		return { success: true };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error : new Error(String(error)),
		};
	}
}

/**
 * Delete all attachments for an email
 */
export async function deleteEmailAttachments(
	r2: R2Bucket,
	emailId: string,
): Promise<{ success: boolean; deletedCount: number; error?: Error }> {
	try {
		const prefix = `attachments/${emailId}/`;
		const objects = await r2.list({ prefix });

		if (objects.objects.length === 0) {
			return { success: true, deletedCount: 0 };
		}

		// Delete all objects with this prefix
		const deletePromises = objects.objects.map((obj) => r2.delete(obj.key));
		await Promise.all(deletePromises);

		return { success: true, deletedCount: objects.objects.length };
	} catch (error) {
		return {
			success: false,
			deletedCount: 0,
			error: error instanceof Error ? error : new Error(String(error)),
		};
	}
}
