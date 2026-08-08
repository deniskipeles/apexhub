import React from 'react';

interface Props {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: Props) {
  if (!content) return null;

  // Simple formatting helper for markdown text elements
  const formatText = (text: string) => {
    return text.split('\n\n').map((paragraph, pIdx) => {
      // Code blocks
      if (paragraph.startsWith('```')) {
        const lines = paragraph.split('\n');
        const lang = lines[0].replace('```', '') || 'code';
        const codeContent = lines.slice(1, -1).join('\n');
        return (
          <div key={pIdx} className="my-4 rounded-xl border border-border bg-[#0d0d0d] overflow-hidden shadow-lg">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5 font-mono text-[10px] text-zinc-400 uppercase">
              <span>{lang}</span>
              <button
                onClick={() => navigator.clipboard.writeText(codeContent)}
                className="hover:text-white transition-colors"
              >
                Copy
              </button>
            </div>
            <pre className="p-4 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed">
              <code>{codeContent}</code>
            </pre>
          </div>
        );
      }

      // Headings
      if (paragraph.startsWith('# ')) {
        return <h1 key={pIdx} className="text-2xl md:text-3xl font-bold text-foreground my-4 tracking-tight">{paragraph.replace('# ', '')}</h1>;
      }
      if (paragraph.startsWith('## ')) {
        return <h2 key={pIdx} className="text-xl md:text-2xl font-bold text-foreground mt-6 mb-3 tracking-tight border-b border-border/50 pb-2">{paragraph.replace('## ', '')}</h2>;
      }
      if (paragraph.startsWith('### ')) {
        return <h3 key={pIdx} className="text-lg font-bold text-foreground mt-4 mb-2">{paragraph.replace('### ', '')}</h3>;
      }

      // Lists
      if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
        const items = paragraph.split('\n');
        return (
          <ul key={pIdx} className="list-disc list-inside space-y-1 my-3 text-muted text-sm leading-relaxed">
            {items.map((item, iIdx) => (
              <li key={iIdx}>{item.replace(/^[-*]\s+/, '')}</li>
            ))}
          </ul>
        );
      }

      // Default paragraph
      return (
        <p key={pIdx} className="my-3 text-muted leading-relaxed text-sm md:text-base">
          {paragraph}
        </p>
      );
    });
  };

  return (
    <div className={`prose dark:prose-invert max-w-none ${className}`}>
      {formatText(content)}
    </div>
  );
}
