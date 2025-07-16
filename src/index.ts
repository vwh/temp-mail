import app from './app';
import { handleEmail } from './handlers/emailHandler';
import { handleScheduled } from './handlers/scheduledHandler';

export default {
	fetch: app.fetch,
	email: handleEmail,
	scheduled: handleScheduled,
};