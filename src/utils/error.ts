export function throwError(message: string) {
	console.error(message);
	throw new Error(message);
}
