import { convert } from 'html-to-text';

export function htmlToText(html: string): string {
    return convert(html, {
        wordwrap: 130,
    });
}

export function textToHtmlTemplate(text: string): string {
    // Basic HTML template for plain text emails
    return `<pre style="font-family: sans-serif; white-space: pre-wrap;">${text}</pre>`;
}