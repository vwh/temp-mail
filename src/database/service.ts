import type { Attachment, AttachmentSummary } from "@/schemas/attachments";
import type { Email, EmailSummary } from "@/schemas/emails";

export class DatabaseService {
	constructor(private db: D1Database) {}

	// Email operations
	async insertEmail(emailData: Email) {
		try {
			const { success, error, meta } = await this.db
				.prepare(
					`INSERT INTO emails (id, from_address, to_address, subject, received_at, html_content, text_content, has_attachments, attachment_count)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				)
				.bind(
					emailData.id,
					emailData.from_address,
					emailData.to_address,
					emailData.subject,
					emailData.received_at,
					emailData.html_content,
					emailData.text_content,
					emailData.has_attachments,
					emailData.attachment_count,
				)
				.run();
			return { success, error, meta };
		} catch (e: unknown) {
			const error = e instanceof Error ? e : new Error(String(e));
			return { success: false, error: error, meta: undefined };
		}
	}

	async getEmailsByRecipient(emailAddress: string, limit: number, offset: number) {
		try {
			const { results, error } = await this.db
				.prepare(
					`SELECT id, from_address, to_address, subject, received_at, has_attachments, attachment_count
         FROM emails
         WHERE to_address = ?
         ORDER BY received_at DESC
         LIMIT ? OFFSET ?`,
				)
				.bind(emailAddress, limit, offset)
				.all();

			// Convert integer boolean values to actual booleans
			const processedResults = (results as any[]).map(email => ({
				...email,
				has_attachments: Boolean(email.has_attachments)
			}));

			return { results: processedResults as EmailSummary[], error };
		} catch (e: unknown) {
			const error = e instanceof Error ? e : new Error(String(e));
			return { results: [], error };
		}
	}

	async getEmailById(emailId: string) {
		try {
			const { results, error } = await this.db
				.prepare(`SELECT * FROM emails WHERE id = ?`)
				.bind(emailId)
				.all();

			if (results[0]) {
				// Convert integer boolean values to actual booleans
				const email = {
					...results[0],
					has_attachments: Boolean(results[0].has_attachments)
				};
				return { result: email as Email, error };
			}

			return { result: undefined, error };
		} catch (e: unknown) {
			const error = e instanceof Error ? e : new Error(String(e));
			return { result: undefined, error };
		}
	}

	async countEmailsByRecipient(emailAddress: string) {
		try {
			const { results, error } = await this.db
				.prepare(`SELECT COUNT(*) as count FROM emails WHERE to_address = ?`)
				.bind(emailAddress)
				.all();
			return { count: results[0]?.count || 0, error };
		} catch (e: unknown) {
			const error = e instanceof Error ? e : new Error(String(e));
			return { count: 0, error };
		}
	}

	async deleteEmailsByRecipient(emailAddress: string) {
		try {
			const { meta, error } = await this.db
				.prepare(`DELETE FROM emails WHERE to_address = ?`)
				.bind(emailAddress)
				.run();
			return { meta, error };
		} catch (e: unknown) {
			const error = e instanceof Error ? e : new Error(String(e));
			return { meta: undefined, error };
		}
	}

	async deleteEmailById(emailId: string) {
		try {
			const { meta, error } = await this.db
				.prepare(`DELETE FROM emails WHERE id = ?`)
				.bind(emailId)
				.run();
			return { meta, error };
		} catch (e: unknown) {
			const error = e instanceof Error ? e : new Error(String(e));
			return { meta: undefined, error };
		}
	}

	// Attachment operations
	async insertAttachment(attachmentData: Attachment) {
		try {
			const { success, error, meta } = await this.db
				.prepare(
					`INSERT INTO attachments (id, email_id, filename, content_type, size, r2_key, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
				)
				.bind(
					attachmentData.id,
					attachmentData.email_id,
					attachmentData.filename,
					attachmentData.content_type,
					attachmentData.size,
					attachmentData.r2_key,
					attachmentData.created_at,
				)
				.run();
			return { success, error, meta };
		} catch (e: unknown) {
			const error = e instanceof Error ? e : new Error(String(e));
			return { success: false, error: error, meta: undefined };
		}
	}

	async getAttachmentsByEmailId(emailId: string) {
		try {
			const { results, error } = await this.db
				.prepare(
					`SELECT id, filename, content_type, size, created_at
         FROM attachments
         WHERE email_id = ?
         ORDER BY created_at ASC`,
				)
				.bind(emailId)
				.all();
			return { results: results as AttachmentSummary[], error };
		} catch (e: unknown) {
			const error = e instanceof Error ? e : new Error(String(e));
			return { results: [], error };
		}
	}

	async getAttachmentById(attachmentId: string) {
		try {
			const { results, error } = await this.db
				.prepare(`SELECT * FROM attachments WHERE id = ?`)
				.bind(attachmentId)
				.all();
			return { result: results[0] as Attachment | undefined, error };
		} catch (e: unknown) {
			const error = e instanceof Error ? e : new Error(String(e));
			return { result: undefined, error };
		}
	}

	async deleteAttachmentById(attachmentId: string) {
		try {
			const { success, error, meta } = await this.db
				.prepare(`DELETE FROM attachments WHERE id = ?`)
				.bind(attachmentId)
				.run();
			return { success, error, meta };
		} catch (e: unknown) {
			const error = e instanceof Error ? e : new Error(String(e));
			return { success: false, error: error, meta: undefined };
		}
	}

	async updateEmailAttachmentInfo(
		emailId: string,
		hasAttachments: boolean,
		attachmentCount: number,
	) {
		try {
			const { success, error, meta } = await this.db
				.prepare(
					`UPDATE emails
         SET has_attachments = ?, attachment_count = ?
         WHERE id = ?`,
				)
				.bind(hasAttachments, attachmentCount, emailId)
				.run();
			return { success, error, meta };
		} catch (e: unknown) {
			const error = e instanceof Error ? e : new Error(String(e));
			return { success: false, error: error, meta: undefined };
		}
	}

	// Optimized attachment query
	async getEmailsWithAttachments(emailAddress: string, limit: number, offset: number) {
		try {
			const { results, error } = await this.db
				.prepare(
					`SELECT
            e.id, e.from_address, e.to_address, e.subject, e.received_at,
            e.has_attachments, e.attachment_count,
            a.id as att_id, a.filename, a.content_type, a.size, a.created_at as att_created_at
          FROM emails e
          LEFT JOIN attachments a ON e.id = a.email_id
          WHERE e.to_address = ?
          ORDER BY e.received_at DESC, a.created_at ASC
          LIMIT ? OFFSET ?`,
				)
				.bind(emailAddress, limit, offset)
				.all();

			if (error) {
				return { results: [], error };
			}

			// Group results by email and combine attachments
			const emailMap = new Map<string, any>();

			for (const row of results as any[]) {
				const emailId = row.id;

				if (!emailMap.has(emailId)) {
					emailMap.set(emailId, {
						id: emailId,
						from_address: row.from_address,
						to_address: row.to_address,
						subject: row.subject,
						received_at: row.received_at,
						has_attachments: row.has_attachments,
						attachment_count: row.attachment_count,
						attachments: [],
					});
				}

				if (row.att_id) {
					const email = emailMap.get(emailId);
					email.attachments.push({
						id: row.att_id,
						filename: row.filename,
						content_type: row.content_type,
						size: row.size,
						created_at: row.att_created_at,
					});
				}
			}

			const emailsWithAttachments = Array.from(emailMap.values());
			const allAttachments = emailsWithAttachments.flatMap((email) =>
				email.attachments.map((att: any) => ({
					...att,
					email_id: email.id,
				})),
			);

			return { results: allAttachments, error: undefined };
		} catch (e: unknown) {
			const error = e instanceof Error ? e : new Error(String(e));
			return { results: [], error };
		}
	}
}
