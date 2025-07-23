import { convert } from "html-to-text";

/**
 * Safely get the domain from an email address
 */
export function getDomain(email: string): string {
	const parts = email.split("@");
	return (parts.length > 1 ? parts.pop() : email)?.trim() ?? email;
}

/**
 * Convert HTML to plain text
 */
function htmlToText(html: string): string | null {
	const text = convert(html, {
		wordwrap: 130,
	});

	return text.trim() === "" ? null : text;
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
 * Process email content
 */
export function processEmailContent(
	html: string | null,
	text: string | null,
): {
	htmlContent: string | null;
	textContent: string | null;
} {
	// Both exist - return as-is
	if (html && text) {
		return { htmlContent: html, textContent: text };
	}

	// Only HTML exists - generate text
	if (html && !text) {
		return { htmlContent: html, textContent: htmlToText(html) };
	}

	// Only text exists - generate HTML
	if (!html && text) {
		return { htmlContent: textToHtmlTemplate(text), textContent: text };
	}

	// Neither exists
	return { htmlContent: null, textContent: null };
}
