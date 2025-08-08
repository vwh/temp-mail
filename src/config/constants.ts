/**
 * Application constants
 */

// Attachment limits
export const ATTACHMENT_LIMITS = {
	MAX_SIZE: 50 * 1024 * 1024, // 50MB
	MAX_COUNT_PER_EMAIL: 10,
	ALLOWED_TYPES: [
		// Images
		"image/jpeg",
		"image/png",
		"image/gif",
		"image/webp",
		"image/svg+xml",
		// Documents
		"application/pdf",
		"text/plain",
		"text/csv",
		"application/msword",
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		"application/vnd.ms-excel",
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		"application/vnd.ms-powerpoint",
		"application/vnd.openxmlformats-officedocument.presentationml.presentation",
		// Archives
		"application/zip",
		"application/x-rar-compressed",
		"application/x-7z-compressed",
		// Database files
		"application/x-sqlite3",
		"application/vnd.sqlite3",
		// Other
		"application/json",
		"application/xml",
		"text/xml",
		"application/octet-stream", // Generic binary files
	],
} as const;

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
