import { Context } from 'hono';

import * as db from '../db';

type Bindings = { Bindings: CloudflareBindings };

export async function getEmails(c: Context<Bindings>) {
    const { DB } = c.env;

    const emailAddress = c.req.param('emailAddress');
    const limit = Number(c.req.query('limit')) || 10;
    const offset = Number(c.req.query('offset')) || 0;

    const results = await db.getEmailsByRecipient(DB, emailAddress, limit, offset);

    return c.json(results);
}

export async function getEmailById(c: Context<Bindings>) {
    const { DB } = c.env;

    const emailId = c.req.param('emailId');

    const result = await db.getEmailById(DB, emailId);

    if (!result) {
        return c.notFound();
    }

    return c.json(result);
}

export async function deleteEmailsByAddress(c: Context<Bindings>) {
    const { DB } = c.env;

    const emailAddress = c.req.param('emailAddress');

    await db.deleteEmailsByRecipient(DB, emailAddress);

    return c.json({ message: `Emails for ${emailAddress} deleted successfully.` });
}

export async function deleteEmailById(c: Context<Bindings>) {
    const { DB } = c.env;
    
    const emailId = c.req.param('emailId');

    await db.deleteEmailById(DB, emailId);

    return c.json({ message: `Email with ID ${emailId} deleted successfully.` });
}