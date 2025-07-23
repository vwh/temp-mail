import { logInfo } from "./logger";

export async function sendMessage(text: string, env: CloudflareBindings) {
	if (!env.TELEGRAM_LOG_ENABLE || !env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
		logInfo("Telegram logging is disabled.");
	}

	const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;

	await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			chat_id: Number(env.TELEGRAM_CHAT_ID),
			text,
			parse_mode: "Markdown",
		}),
	});
}
