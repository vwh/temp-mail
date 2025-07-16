export async function handleScheduled(event: ScheduledEvent, env: CloudflareBindings, ctx: ExecutionContext) {
	console.log("Running scheduled email cleanup...");
	const { DB } = env;

	const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000);

	const { success, error } = await DB.prepare("DELETE FROM emails WHERE received_at < ?").bind(threeDaysAgo).run();

	if (success) {
		console.log("Email cleanup completed successfully.");
	} else {
		console.error("Email cleanup failed:", error);
	}
}