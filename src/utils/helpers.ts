/**
 * Get current timestamp in seconds
 */
export function now() {
	return Math.floor(Date.now() / 1000);
}

/**
 * Throw an error
 */
export function throwError(message: string) {
	console.error(message);
	throw new Error(message);
}
