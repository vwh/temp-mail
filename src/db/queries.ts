import { D1Database } from "@cloudflare/workers-types";

/**
 * Insert an email into the database
 */
export async function insertEmail(db: D1Database, emailData: { id: string, from: string, to: string, subject: string | null, receivedAt: number, html: string | null, text: string | null }) {
    await db.prepare(
        `INSERT INTO emails (id, from_address, to_address, subject, received_at, html_content, text_content)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
        emailData.id,
        emailData.from,
        emailData.to,
        emailData.subject,
        emailData.receivedAt,
        emailData.html,
        emailData.text
    )
    .run();
}

/**
 * Get emails by recipient email address
 */
export async function getEmailsByRecipient(db: D1Database, emailAddress: string, limit: number, offset: number) {
    const { results } = await db.prepare(
        `SELECT id, from_address, to_address, subject, received_at
         FROM emails
         WHERE to_address = ?
         ORDER BY received_at DESC
         LIMIT ? OFFSET ?`
    )
    .bind(emailAddress, limit, offset)
    .all();
    return results;
}

/**
 * Get an email by ID
 */
export async function getEmailById(db: D1Database, emailId: string) {
    const emailResult = await db.prepare("SELECT * FROM emails WHERE id = ?").bind(emailId).first();
    return emailResult;
}

/**
 * Delete emails older than a specific timestamp
 */
export async function deleteOldEmails(db: D1Database, timestamp: number) {
    const { success, error } = await db.prepare("DELETE FROM emails WHERE received_at < ?").bind(timestamp).run();
    return { success, error };
}

/**
 * Delete emails by recipient email address
 */
export async function deleteEmailsByRecipient(db: D1Database, emailAddress: string) {
    const { success, error } = await db.prepare("DELETE FROM emails WHERE to_address = ?").bind(emailAddress).run();
    return { success, error };
}

/**
 * Delete an email by ID
 */
export async function deleteEmailById(db: D1Database, emailId: string) {
    const { success, error } = await db.prepare("DELETE FROM emails WHERE id = ?").bind(emailId).run();
    return { success, error };
}