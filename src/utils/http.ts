/**
 *  Hono OK Response
 */
export const OK = <T>(result: T) => ({
	status: true as const,
	result,
});

/**
 *  Hono Error Response
 */
export const ERR = (message: string, name: string = "Error", note?: Record<string, unknown>) => ({
	status: false as const,
	error: { name, message },
	...(note && { note }),
});
