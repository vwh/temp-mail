export function OK(result: unknown) {
	return {
		status: true,
		result: result,
	};
}

export function ERR(message: string, note?: Record<string, unknown>) {
	return {
		status: false,
		error: {
			name: "Error",
			message: message,
		},
		...(note && { note }),
	};
}
