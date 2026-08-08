import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';

function escapeFull(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

const renderer = new marked.Renderer();

renderer.heading = function ({ tokens, depth }: any) {
    // @ts-ignore
    const text = this.parser.parseInline(tokens);
    const styles: Record<number, string> = {
        1: 'font-size:1.875rem;font-weight:700;margin:0 0 1.25rem;letter-spacing:-0.02em;color:var(--foreground);line-height:1.2;word-break:break-word;',
        2: 'font-size:1.4rem;font-weight:700;margin:2rem 0 0.875rem;padding-bottom:0.5rem;border-bottom:1px solid color-mix(in srgb,var(--foreground) 15%,transparent);color:var(--foreground);line-height:1.3;word-break:break-word;',
        3: 'font-size:1.15rem;font-weight:700;margin:1.5rem 0 0.625rem;color:var(--foreground);word-break:break-word;',
        4: 'font-size:1rem;font-weight:600;margin:1.25rem 0 0.5rem;color:var(--foreground);',
        5: 'font-size:0.9rem;font-weight:600;margin:1rem 0 0.25rem;color:var(--foreground);',
        6: 'font-size:0.8rem;font-weight:500;margin:0.75rem 0 0.25rem;color:var(--muted-foreground);',
    };
    return `<h${depth} style="${styles[depth] ?? 'font-weight:700;'}">${text}</h${depth}>\n`;
};

renderer.paragraph = function ({ tokens }: any) {
    // @ts-ignore
    const text = this.parser.parseInline(tokens);
    return `<p style="margin:0 0 1rem;color:var(--muted-foreground);line-height:1.75;word-break:break-word;overflow-wrap:break-word;">${text}</p>\n`;
};

renderer.list = function (token: any) {
    const ordered   = token.ordered;
    const start     = token.start;
    let body = '';
    for (let j = 0; j < token.items.length; j++) {
        // @ts-ignore
        body += this.listitem(token.items[j]);
    }
    const tag       = ordered ? 'ol' : 'ul';
    const listStyle = ordered ? 'decimal' : 'disc';
    const startAttr = ordered && start !== 1 ? ` start="${start}"` : '';
    return `<${tag} style="list-style:${listStyle};margin:0 0 1.25rem 1.5rem;padding:0;display:block;"${startAttr}>${body}</${tag}>\n`;
};

renderer.listitem = function (token: any) {
    // @ts-ignore
    const text = this.parser.parse(token.tokens);
    return `<li style="margin-bottom:0.4rem;padding-left:0.25rem;color:var(--muted-foreground);line-height:1.75;display:list-item;word-break:break-word;">${text}</li>\n`;
};

renderer.table = function (token: any) {
    // @ts-ignore
    const headerCells = token.header.map((cell: any) => {
        // @ts-ignore
        const text = this.parser.parseInline(cell.tokens);
        return `<th style="padding:0.5rem 1rem;text-align:left;font-weight:600;font-size:0.875rem;color:var(--foreground);border-bottom:2px solid color-mix(in srgb,var(--foreground) 20%,transparent);white-space:nowrap;">${text}</th>`;
    }).join('');

    // @ts-ignore
    const bodyRows = token.rows.map((row: any[], rowIdx: number) => {
        // @ts-ignore
        const cells = row.map((cell: any) => {
            // @ts-ignore
            const text = this.parser.parseInline(cell.tokens);
            return `<td style="padding:0.5rem 1rem;color:var(--muted-foreground);border-bottom:1px solid color-mix(in srgb,var(--foreground) 10%,transparent);font-size:0.9rem;">${text}</td>`;
        }).join('');
        const bg = rowIdx % 2 === 0 ? '' : 'background:color-mix(in srgb,var(--foreground) 3%,transparent);';
        return `<tr style="${bg}">${cells}</tr>`;
    }).join('');

    return (
        `<div style="overflow-x:auto;margin:0 0 1.25rem;max-width:100%;box-sizing:border-box;">\n` +
        `<table style="width:100%;border-collapse:collapse;font-size:0.9rem;">\n` +
        `<thead><tr>${headerCells}</tr></thead>\n` +
        `<tbody>${bodyRows}</tbody>\n` +
        `</table></div>\n`
    );
};

renderer.image = function ({ href, title, text }: any) {
    const t = title ? ` title="${title}"` : '';
    const a = text ? ` alt="${text}"` : '';
    return `<img src="${href}"${t}${a} style="max-width:100%;height:auto;border-radius:6px;display:block;margin:1rem 0;" />`;
};

renderer.link = function ({ href, title, tokens }: any) {
    // @ts-ignore
    const text = this.parser.parseInline(tokens);
    const t = title ? ` title="${title}"` : '';
    return `<a href="${href}"${t} style="color:#16a34a;text-decoration:underline;text-underline-offset:3px;text-decoration-color:rgba(22,163,74,0.35);transition:color 0.15s;overflow-wrap:break-word;word-break:break-all;" target="_blank" rel="noopener noreferrer">${text}</a>`;
};

renderer.blockquote = function ({ tokens }: any) {
    // @ts-ignore
    const text = this.parser.parse(tokens);
    return (
        `<blockquote style="border-left:3px solid #16a34a;margin:1.25rem 0;padding:0.75rem 1rem;` +
        `background:rgba(22,163,74,0.06);border-radius:0 6px 6px 0;` +
        `color:var(--muted-foreground);font-style:italic;line-height:1.75;word-break:break-word;">` +
        `${text}</blockquote>\n`
    );
};

renderer.codespan = function ({ text }: any) {
    return (
        `<code style="background:rgba(22,163,74,0.12);border:1px solid rgba(22,163,74,0.25);` +
        `padding:0.15em 0.45em;border-radius:4px;font-size:0.875em;font-family:monospace;` +
        `color:#fbbf24;word-break:break-word;overflow-wrap:break-word;">${escapeFull(text)}</code>`
    );
};

renderer.strong = function ({ tokens }: any) {
    // @ts-ignore
    const text = this.parser.parseInline(tokens);
    let style = 'font-weight:700;color:var(--foreground);';
    if (/\bAdded\b/.test(text))                    style = 'font-weight:700;color:#16a34a;';
    else if (/\bFixed\b/.test(text))               style = 'font-weight:700;color:#dc2626;';
    else if (/\b(Changed|Improved)\b/.test(text))  style = 'font-weight:700;color:#f59e0b;';
    return `<strong style="${style}">${text}</strong>`;
};

marked.use({ renderer, breaks: true, gfm: true });

interface CodeStash {
    marker: string;
    html:   string;
}

function renderCodeBlock(lang: string, text: string): string {
    let highlighted = escapeFull(text);
    const cleanLang = lang ? lang.trim().toLowerCase() : '';

    if (cleanLang && hljs.getLanguage(cleanLang)) {
        try {
            highlighted = hljs.highlight(text, { language: cleanLang }).value;
        } catch (e) {
            console.warn("Syntax highlighting failed for language:", cleanLang, e);
        }
    }

    return (
        `<div class="hljs" style="margin:1rem 0;border-radius:8px;border:1px solid color-mix(in srgb,var(--foreground) 10%,transparent);` +
        `overflow:hidden;max-width:100%;box-sizing:border-box;">` +
        (lang
            ? `<div style="padding:0.3rem 1rem;font-size:0.7rem;font-family:monospace;` +
              `color:var(--muted-foreground);border-bottom:1px solid color-mix(in srgb,var(--foreground) 8%,transparent);` +
              `letter-spacing:0.05em;opacity:0.7;">${lang}</div>`
            : '') +
        `<pre style="margin:0;padding:1rem;overflow-x:auto;max-width:100%;box-sizing:border-box;background:transparent;">` +
        `<code class="hljs ${cleanLang ? 'language-' + cleanLang : ''}" style="font-family:monospace;font-size:0.875rem;white-space:pre;background:transparent;border:none;padding:0;">${highlighted}</code></pre></div>`
    );
}

function extractCodeBlocks(markdown: string): { safe: string; stash: CodeStash[] } {
    const stash: CodeStash[] = [];
    const safe = markdown.replace(/^```([^\n]*)\n([\s\S]*?)^```[ \t]*$/gm, (_match, lang, body) => {
        const marker = `APEXMD_CODE_${stash.length}_PLACEHOLDER`;
        stash.push({
            marker,
            html: renderCodeBlock(lang.trim(), body),
        });
        return `\n\n${marker}\n\n`;
    });
    return { safe, stash };
}

function restoreCodeBlocks(html: string, stash: CodeStash[]): string {
    let result = html;
    for (const { marker, html: codeHtml } of stash) {
        const regex = new RegExp(`<p[^>]*>\\s*${marker}\\s*<\\/p>|${marker}`, 'g');
        result = result.replace(regex, codeHtml);
    }
    return result;
}

export const renderMarkdown = async (content: string): Promise<string> => {
    if (!content) return '';

    const { safe, stash } = extractCodeBlocks(content);
    const rawHtml = await marked.parse(safe) as string;

    const sanitized = typeof window !== 'undefined'
        ? DOMPurify.sanitize(rawHtml, {
            ALLOWED_TAGS: [
                'h1','h2','h3','h4','h5','h6',
                'p','br','hr','blockquote',
                'ul','ol','li',
                'table','thead','tbody','tr','th','td',
                'pre','code','div','span',
                'a','strong','em','b','i',
            ],
            ALLOWED_ATTR: ['style', 'href', 'target', 'rel', 'title', 'start'],
        })
        : rawHtml;

    return restoreCodeBlocks(sanitized, stash);
};
