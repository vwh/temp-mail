import { Hono } from 'hono';
import { getEmails, getEmailById } from '../controllers/emailController';

const emailRoutes = new Hono();

emailRoutes.get('/emails/:emailAddress', getEmails);
emailRoutes.get('/inbox/:emailId', getEmailById);

export default emailRoutes;