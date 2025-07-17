import { Hono } from 'hono';
import { getEmails, getEmailById, deleteEmailsByAddress, deleteEmailById } from '../controllers/emailController';

const emailRoutes = new Hono();

emailRoutes.get('/emails/:emailAddress', getEmails);
emailRoutes.delete('/emails/:emailAddress', deleteEmailsByAddress);
emailRoutes.get('/inbox/:emailId', getEmailById);
emailRoutes.delete('/inbox/:emailId', deleteEmailById);

export default emailRoutes;