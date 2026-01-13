import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Configure marked renderer with Tailwind classes
const renderer = new marked.Renderer();

renderer.heading = function ({ tokens, depth }: any) {
    // @ts-ignore
    const text = this.parser.parseInline(tokens);
    const classes = [
        'text-3xl font-bold mb-6 text-foreground tracking-tight', // h1
        'text-2xl font-bold mb-4 mt-8 text-foreground pb-2 border-b border-border/50', // h2
        'text-xl font-bold mb-3 mt-6 text-foreground', // h3
        'text-lg font-semibold mb-2 mt-4 text-foreground', // h4
        'text-base font-medium mb-1 mt-2 text-foreground', // h5
        'text-sm font-medium mb-1 text-muted' // h6
    ][depth - 1] || 'font-bold';
    return `<h${depth} class="${classes}">${text}</h${depth}>\n`;
};

renderer.paragraph = function ({ tokens }: any) {
    // @ts-ignore
    const text = this.parser.parseInline(tokens);
    return `<p class="mb-4 text-muted leading-7">${text}</p>\n`;
};

renderer.list = function (token: any) {
    const ordered = token.ordered;
    const start = token.start;
    let body = '';
    for (let i = 0; i < token.items.length; i++) {
        // @ts-ignore
        body += this.listitem(token.items[i]);
    }
    const type = ordered ? 'list-decimal' : 'list-disc';
    const startAttr = ordered && start !== 1 ? ` start="${start}"` : '';
    return `<ul class="${type} ml-6 mb-6 marker:text-muted/50 space-y-2"${startAttr}>${body}</ul>\n`;
};

renderer.listitem = function (token: any) {
    // @ts-ignore
    const text = this.parser.parse(token.tokens);
    return `<li class="text-zinc-300 pl-1">${text}</li>\n`;
};

renderer.link = function ({ href, title, tokens }: any) {
    // @ts-ignore
    const text = this.parser.parseInline(tokens);
    return `<a href="${href}" class="text-primary hover:text-primary-hover underline decoration-primary/30 underline-offset-2 transition-colors" target="_blank" rel="noopener noreferrer" title="${title || ''}">${text}</a>`;
};

renderer.blockquote = function ({ tokens }: any) {
    // @ts-ignore
    const text = this.parser.parse(tokens);
    return `<blockquote class="border-l-4 border-primary/50 pl-4 italic my-6 py-2 pr-2 bg-primary/5 rounded-r text-zinc-400">${text}</blockquote>\n`;
};

renderer.codespan = function ({ text }: any) {
    return `<code class="bg-black/30 border border-border px-1.5 py-0.5 rounded text-sm font-mono text-accent">${text}</code>`;
};

renderer.code = function ({ text }: any) {
    return `<div class="my-4 rounded-lg border border-border bg-[#0d0d0d] overflow-x-auto p-4 shadow-inner"><pre><code class="text-sm font-mono text-zinc-300">${text}</code></pre></div>`;
};

renderer.strong = function ({ tokens }: any) {
    // @ts-ignore
    const text = this.parser.parseInline(tokens);
    let colorClass = 'text-foreground font-bold';
    
    // Semantic Highlighting for Changelogs
    if (text.includes('Added')) colorClass = 'text-green-500 font-bold';
    if (text.includes('Fixed')) colorClass = 'text-red-400 font-bold';
    if (text.includes('Changed') || text.includes('Improved')) colorClass = 'text-yellow-500 font-bold';
    
    return `<strong class="${colorClass}">${text}</strong>`;
};

marked.use({
    renderer,
    breaks: true,
    gfm: true
});

/**
 * Renders Markdown string to Sanitized HTML with Tailwind classes
 */
export const renderMarkdown = async (content: string): Promise<string> => {
    if (!content) return '';
    const rawHtml = await marked.parse(content);
    if (typeof window === 'undefined') return rawHtml as string;
    return DOMPurify.sanitize(rawHtml);
};