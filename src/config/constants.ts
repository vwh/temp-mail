/**
 * Application constants
 */

// HTML processing constants
export const HTML_PROCESSING = {
	WORDWRAP_LENGTH: 130,
	MAX_CONVERSION_SIZE: 900 * 1024, // 900KB limit for HTML to text conversion
} as const;

// KV operation constants
export const KV_LIMITS = {
	MAX_SENDER_KEYS: 1000,
	BATCH_SIZE: 50,
	LIST_BATCH_SIZE: 100,
} as const;

// Cache constants
export const CACHE = {
	DOMAINS_TTL: 3600, // 1 hour
} as const;
