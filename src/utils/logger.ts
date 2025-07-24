/**
 * Logger
 */
export function log(level: "info" | "error", message: string, context?: Record<string, unknown>) {
	const logEntry = {
		timestamp: new Date().toISOString(),
		level: level.toUpperCase(),
		message,
		...context,
	};

	console.log(JSON.stringify(logEntry));
}

export function logInfo(message: string, context?: Record<string, unknown>) {
	log("info", message, context);
}

export function logError(message: string, error?: Error, context?: Record<string, unknown>) {
	log("error", message, {
		errorName: error?.name,
		errorMessage: error?.message,
		errorStack: error?.stack,
		...context,
	});
}
