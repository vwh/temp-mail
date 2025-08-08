import { convert } from "html-to-text";
import { HTML_PROCESSING } from "@/config/constants";

/**
 * Safely get the domain from an email address
 */
export function getDomain(email: string): string {
	const parts = email.split("@");
	return (parts.length > 1 ? parts.pop() : email)?.trim() ?? email;
}

/**
 * Sanitize HTML content by removing potentially dangerous elements
 */
function sanitizeHtml(html: string): string {
	// Basic HTML sanitization - remove script tags and event handlers
	return html
		.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
		.replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
		.replace(/javascript:/gi, "")
		.replace(/<iframe\b[^>]*>/gi, "")
		.replace(/<object\b[^>]*>/gi, "")
		.replace(/<embed\b[^>]*>/gi, "");
}

/**
 * Convert HTML to plain text with size limits and error handling
 */
function htmlToText(html: string): string | null {
	try {
		// Check size limit before processing
		if (new TextEncoder().encode(html).byteLength > HTML_PROCESSING.MAX_CONVERSION_SIZE) {
			console.warn("HTML content too large for conversion, truncating");
			html = html.substring(0, HTML_PROCESSING.MAX_CONVERSION_SIZE);
		}

		const text = convert(html, {
			wordwrap: HTML_PROCESSING.WORDWRAP_LENGTH,
			selectors: [
				// Remove potentially dangerous content
				{ selector: "script", format: "skip" },
				{ selector: "style", format: "skip" },
				{ selector: "iframe", format: "skip" },
			],
		});

		return text.trim() === "" ? null : text;
	} catch (error) {
		console.error("Failed to convert HTML to text:", error);
		return null;
	}
}

/**
 * Convert plain text to HTML template
 */
function textToHtmlTemplate(text: string): string | null {
	if (text.trim() === "") {
		return null;
	}

	return `<pre style="font-family: sans-serif; white-space: pre-wrap;">${text}</pre>`;
}

/**
 * Process email content with sanitization and size validation
 */
export function processEmailContent(
	html: string | null,
	text: string | null,
): {
	htmlContent: string | null;
	textContent: string | null;
} {
	// Sanitize HTML content if present
	const sanitizedHtml = html ? sanitizeHtml(html) : null;

	// Both exist - return sanitized HTML and original text
	if (sanitizedHtml && text) {
		return { htmlContent: sanitizedHtml, textContent: text };
	}

	// Only HTML exists - generate text from sanitized HTML
	if (sanitizedHtml && !text) {
		return { htmlContent: sanitizedHtml, textContent: htmlToText(sanitizedHtml) };
	}

	// Only text exists - generate HTML template
	if (!sanitizedHtml && text) {
		return { htmlContent: textToHtmlTemplate(text), textContent: text };
	}

	// Neither exists
	return { htmlContent: null, textContent: null };
}
