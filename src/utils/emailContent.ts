import { convert } from 'html-to-text';

/**
 * Convert HTML to plain text
 */
export function htmlToText(html: string): string | null {
    const text = convert(html, {
        wordwrap: 130,
    });

    return text.trim() === '' ? null : text;
}

/**
 * Convert plain text to HTML template
 */
export function textToHtmlTemplate(text: string): string | null {
    if (text.trim() === '') {
        return null;
    }
    
    return `<pre style="font-family: sans-serif; white-space: pre-wrap;">${text}</pre>`;
}