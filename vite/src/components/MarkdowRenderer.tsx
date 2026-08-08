import React, { useEffect, useState } from 'react';
import { renderMarkdown } from '@/lib/commonHelpers';

interface MarkdownRendererProps {
    content: string;
    className?: string;
    style?: React.CSSProperties;
}

export function MarkdownRenderer({ content, className="prose prose-zinc dark:prose-invert max-w-none", style }: MarkdownRendererProps) {
    const [html, setHtml] = useState('');

    useEffect(() => {
        const rm = async () => {
            await renderMarkdown(content).then(setHtml);
        };
        rm();
    }, [content]);

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
