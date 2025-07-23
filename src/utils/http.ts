/**
 *  Hono OK Response
 */
export function OK(result: unknown) {
	return {
		status: true,
		result: result,
	};
}

/**
 *  Hono Error Response
 */
export function ERR(message: string, name: string = "Error", note?: Record<string, unknown>) {
	return {
		status: false,
		error: {
			name: name,
			message: message,
		},
		...(note && { note }),
	};
}
