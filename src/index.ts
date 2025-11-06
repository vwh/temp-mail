import app from "@/app";

import { handleEmail } from "@/handlers/emailHandler";
import { handleScheduled } from "@/handlers/scheduledHandler";

export default {
	// Hono ( Cloudflare Worker )
	fetch: app.fetch,

	// Cloudflare email router
	email: handleEmail,

	// Cloudflare Scheduled Functions
	scheduled: (event: ScheduledEvent, env: CloudflareBindings, ctx: ExecutionContext) => {
		switch (event.cron) {
			case "0 */4 * * *":
				return handleScheduled(event, env, ctx);
		}
	},
};
