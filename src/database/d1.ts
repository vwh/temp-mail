import type { Email, EmailSummary } from "@/schemas/emails/schema";

/**
 * Insert an email into the database
 */
export async function insertEmail(db: D1Database, emailData: Email) {
	try {
		const { success, error, meta } = await db
			.prepare(
				`INSERT INTO emails (id, from_address, to_address, subject, received_at, html_content, text_content)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
			)
			.bind(
				emailData.id,
				emailData.from_address,
				emailData.to_address,
				emailData.subject,
				emailData.received_at,
				emailData.html_content,
				emailData.text_content,
			)
			.run();
		return { success, error, meta };
	} catch (e: unknown) {
		const error = e instanceof Error ? e : new Error(String(e));
		return { success: false, error: error, meta: undefined };
	}
}

/**
 * Get emails by recipient email address
 */
export async function getEmailsByRecipient(
	db: D1Database,
	emailAddress: string,
	limit: number,
	offset: number,
) {
	try {
		const { results } = await db
			.prepare(
				`SELECT id, from_address, to_address, subject, received_at
         FROM emails
         WHERE to_address = ?
         ORDER BY received_at DESC
         LIMIT ? OFFSET ?`,
			)
			.bind(emailAddress, limit, offset)
			.all();
		return { results: results as EmailSummary[], error: undefined };
	} catch (e: unknown) {
		const error = e instanceof Error ? e : new Error(String(e));
		return { results: [], error: error };
	}
}

/**
 * Get an email by ID
 */
export async function getEmailById(db: D1Database, emailId: string) {
	try {
		const emailResult = await db.prepare("SELECT * FROM emails WHERE id = ?").bind(emailId).first();
		return { result: emailResult as Email | null, error: undefined };
	} catch (e: unknown) {
		const error = e instanceof Error ? e : new Error(String(e));
		return { result: null, error: error };
	}
}

/**
 * Delete emails older than a specific timestamp
 */
export async function deleteOldEmails(db: D1Database, timestamp: number) {
	try {
		const { success, error, meta } = await db
			.prepare("DELETE FROM emails WHERE received_at < ?")
			.bind(timestamp)
			.run();
		return { success, error, meta };
	} catch (e: unknown) {
		const error = e instanceof Error ? e : new Error(String(e));
		return { success: false, error: error, meta: undefined };
	}
}

/**
 * Delete emails by recipient email address
 */
export async function deleteEmailsByRecipient(db: D1Database, emailAddress: string) {
	try {
		const { success, error, meta } = await db
			.prepare("DELETE FROM emails WHERE to_address = ?")
			.bind(emailAddress)
			.run();
		return { success, error, meta };
	} catch (e: unknown) {
		const error = e instanceof Error ? e : new Error(String(e));
		return { success: false, error: error, meta: undefined };
	}
}

/**
 * Delete an email by ID
 */
export async function deleteEmailById(db: D1Database, emailId: string) {
	try {
		const { success, error, meta } = await db
			.prepare("DELETE FROM emails WHERE id = ?")
			.bind(emailId)
			.run();
		return { success, error, meta };
	} catch (e: unknown) {
		const error = e instanceof Error ? e : new Error(String(e));
		return { success: false, error: error, meta: undefined };
	}
}

/**
 * Count emails by recipient email address
 */
export async function countEmailsByRecipient(db: D1Database, emailAddress: string) {
	try {
		const result = await db
			.prepare("SELECT count(*) as count FROM emails WHERE to_address = ?")
			.bind(emailAddress)
			.first<{ count: number }>();
		return { count: result?.count || 0, error: undefined };
	} catch (e: unknown) {
		const error = e instanceof Error ? e : new Error(String(e));
		return { count: 0, error: error };
	}
}
