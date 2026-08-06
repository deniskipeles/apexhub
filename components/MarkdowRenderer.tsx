'use client';

import { useEffect, useState } from 'react';

interface MarkdownRendererProps {
    content: string;
    className?: string;
    style?: React.CSSProperties;
}

export function MarkdownRenderer({ content, className="prose prose-zinc dark:prose-invert max-w-none", style }: MarkdownRendererProps) {
    const [html, setHtml] = useState('');

    useEffect(() => {
        let isMounted = true;
        const rm = async()=>{
            // Dynamic import keeps heavy libraries completely out of the Cloudflare Edge Worker
            const { renderMarkdown } = await import('@/lib/commonHelpers');
            const result = await renderMarkdown(content);
            if (isMounted) setHtml(result);
        }
        rm()
        return () => { isMounted = false; };
    }, [content]);

    if (!html) return <div className="animate-pulse h-12 bg-surface/50 rounded-xl w-full"></div>;

    return (
        <div
            className={className}
            style={{
                fontFamily: 'inherit',
                maxWidth: '100%',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                ...style,
            }}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}