import { convert } from 'html-to-text';

/**
 * Convert HTML to plain text
 */
export function htmlToText(html: string): string {
    return convert(html, {
        wordwrap: 130,
    });
}

/**
 * Convert plain text to HTML template
 */
export function textToHtmlTemplate(text: string): string {
    return `<pre style="font-family: sans-serif; white-space: pre-wrap;">${text}</pre>`;
}