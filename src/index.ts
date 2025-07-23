import app from "@/app";

import { handleEmail } from "@/handlers/emailHandler";
import { handleDailyReport, handleScheduled } from "@/handlers/scheduledHandler";

export default {
	fetch: app.fetch,
	email: handleEmail,
	scheduled: (event: ScheduledEvent, env: CloudflareBindings, ctx: ExecutionContext) => {
		switch (event.cron) {
			case "0 */5 * * *":
				return handleScheduled(event, env, ctx);
			case "0 0 * * *":
				return handleDailyReport(event, env, ctx);
		}
	},
};
