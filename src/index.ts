import app from "@/app";

import { handleEmail } from "@/handlers/emailHandler";
import { handleDailyReport, handleScheduled } from "@/handlers/scheduledHandler";

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
			case "0 */5 * * *":
				return handleDailyReport(event, env, ctx);
		}
	},
};
