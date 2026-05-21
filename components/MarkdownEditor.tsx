'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { MarkdownRenderer } from './MarkdowRenderer';

type PanelMode = 'editor' | 'split' | 'preview';
type ToastType = 'success' | 'error' | 'info';

interface Toast { id: number; message: string; type: ToastType; }

export interface MarkdownEditorProps {
    initialValue?: string;
    onChange?: (value: string) => void;
    onSave?: (value: string) => void;
    placeholder?: string;
    className?: string;
}

type InsertFn = (before: string, after?: string, placeholder?: string, selectPlaceholder?: boolean) => void;

interface ToolbarAction {
    icon: string;
    label: string;
    shortcut?: string;
    action: (insert: InsertFn) => void;
    separator?: boolean;
}

const TOOLBAR: ToolbarAction[] = [
    { icon: 'H1', label: 'Heading 1', action: (i) => i('# ', '', 'Heading 1', true) },
    { icon: 'H2', label: 'Heading 2', action: (i) => i('## ', '', 'Heading 2', true) },
    { icon: 'H3', label: 'Heading 3', action: (i) => i('### ', '', 'Heading 3', true), separator: true },
    { icon: 'B',  label: 'Bold',      shortcut: 'Ctrl+B', action: (i) => i('**', '**', 'bold text', true) },
    { icon: 'I',  label: 'Italic',    shortcut: 'Ctrl+I', action: (i) => i('*', '*', 'italic text', true) },
    { icon: 'S',  label: 'Strikethrough', action: (i) => i('~~', '~~', 'strikethrough', true), separator: true },
    { icon: '🔗', label: 'Link',      shortcut: 'Ctrl+K', action: (i) => i('[', '](https://)', 'link text', true) },
    { icon: '🖼',  label: 'Image',     action: (i) => i('![', '](https://)', 'alt text', true) },
    { icon: '`',  label: 'Inline Code', action: (i) => i('`', '`', 'code', true), separator: true },
    { icon: '```', label: 'Code Block', action: (i) => i('```\n', '\n```', 'code here', true) },
    { icon: '❝',  label: 'Blockquote', action: (i) => i('> ', '', 'quote', true) },
    { icon: '—',  label: 'Horizontal Rule', action: (i) => i('\n---\n'), separator: true },
    { icon: 'UL', label: 'Unordered List', action: (i) => i('- ', '', 'list item', true) },
    { icon: 'OL', label: 'Ordered List',   action: (i) => i('1. ', '', 'list item', true) },
    { icon: '☑',  label: 'Task List',      action: (i) => i('- [ ] ', '', 'task', true), separator: true },
    { icon: '⊞',  label: 'Table', action: (i) => i('\n| Column 1 | Column 2 |\n|----------|----------|\n| Cell     | Cell     |\n') },
];

function countWords(t: string) { return t.trim() === '' ? 0 : t.trim().split(/\s+/).length; }
function countLines(t: string) { return t === '' ? 0 : t.split('\n').length; }
function readTime(w: number)   { return `${Math.ceil(w / 200)} min read`; }

export function MarkdownEditor({
    initialValue = '',
    onChange,
    onSave,
    placeholder = 'Start writing…',
    className = '',
}: MarkdownEditorProps) {
    const [value, setValue]   = useState(initialValue);
    const [mode, setMode]     = useState<PanelMode>('split');
    const [title, setTitle]   = useState('Untitled document');
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [saved, setSaved]   = useState(true);
    const [cursor, setCursor] = useState({ line: 1, col: 1 });
    const [findOpen, setFindOpen]     = useState(false);
    const [findVal, setFindVal]       = useState('');
    const [replaceVal, setReplaceVal] = useState('');
    const taRef   = useRef<HTMLTextAreaElement>(null);
    const toastId = useRef(0);

    useEffect(() => { onChange?.(value); setSaved(false); }, [value]);
    useEffect(() => { if (!saved) { const t = setTimeout(() => setSaved(true), 2000); return () => clearTimeout(t); } }, [saved]);

    const addToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = toastId.current++;
        setToasts(p => [...p, { id, message, type }]);
        setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 2500);
    }, []);

    const insertText: InsertFn = useCallback((before, after = '', ph = '', selectPh = false) => {
        const ta = taRef.current;
        if (!ta) return;
        const s = ta.selectionStart, e = ta.selectionEnd;
        const selected = ta.value.slice(s, e);
        const insert   = selected || ph;
        const next     = ta.value.slice(0, s) + before + insert + after + ta.value.slice(e);
        setValue(next);
        requestAnimationFrame(() => {
            ta.focus();
            if (selectPh && !selected) {
                ta.setSelectionRange(s + before.length, s + before.length + insert.length);
            } else {
                const p = s + before.length + insert.length + after.length;
                ta.setSelectionRange(p, p);
            }
        });
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        const ctrl = e.ctrlKey || e.metaKey;
        if (ctrl && e.key === 'b') { e.preventDefault(); insertText('**', '**', 'bold text', true); }
        if (ctrl && e.key === 'i') { e.preventDefault(); insertText('*', '*', 'italic text', true); }
        if (ctrl && e.key === 'k') { e.preventDefault(); insertText('[', '](https://)', 'link text', true); }
        if (ctrl && e.key === 's') { e.preventDefault(); onSave?.(value); setSaved(true); addToast('Saved', 'success'); }
        if (e.key === 'Tab') { e.preventDefault(); insertText('    '); }
        if (e.key === 'Enter') {
            const ta   = e.currentTarget;
            const pos  = ta.selectionStart;
            const line = ta.value.slice(0, pos).split('\n').pop() ?? '';
            const ulM  = line.match(/^(\s*)([-*+])\s/);
            const olM  = line.match(/^(\s*)(\d+)\.\s/);
            if (ulM) {
                if (line.trim() === ulM[2]) {
                    e.preventDefault();
                    const nv = ta.value.slice(0, pos - line.length) + '\n' + ta.value.slice(pos);
                    setValue(nv);
                    requestAnimationFrame(() => ta.setSelectionRange(pos - line.length + 1, pos - line.length + 1));
                } else { e.preventDefault(); insertText(`\n${ulM[1]}${ulM[2]} `); }
            } else if (olM) {
                e.preventDefault();
                insertText(`\n${olM[1]}${parseInt(olM[2]) + 1}. `);
            }
        }
    }, [insertText, value, onSave, addToast]);

    const updateCursor = useCallback((e: React.SyntheticEvent<HTMLTextAreaElement>) => {
        const ta = e.currentTarget;
        const before = ta.value.slice(0, ta.selectionStart).split('\n');
        setCursor({ line: before.length, col: before[before.length - 1].length + 1 });
    }, []);

    const handleReplace = useCallback(() => {
        if (!findVal) return;
        setValue(v => v.split(findVal).join(replaceVal));
        addToast('Replaced all occurrences', 'success');
    }, [findVal, replaceVal, addToast]);

    const matchCount = findVal
        ? (value.match(new RegExp(findVal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length
        : 0;

    const words = countWords(value);

    return (
        <div className={`flex flex-col h-full min-h-0 border border-border rounded-xl overflow-hidden bg-background font-mono ${className}`}>

            {/* ── Top bar ── */}
            <div className="flex items-center gap-2 px-3 h-11 border-b border-border bg-muted/40 flex-shrink-0">
                <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="flex-1 text-sm font-medium bg-transparent border-none outline-none text-foreground font-mono"
                    aria-label="Document title"
                    spellCheck={false}
                />
                <span className={`text-xs font-mono ${saved ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {saved ? '● saved' : '○ unsaved'}
                </span>
                <div className="flex items-center gap-1 ml-1">
                    {(['editor', 'split', 'preview'] as PanelMode[]).map(m => (
                        <button
                            key={m}
                            onClick={() => setMode(m)}
                            className={`px-2.5 py-1 rounded text-xs transition-colors ${
                                mode === m
                                    ? 'bg-background border border-border text-foreground font-medium'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                            }`}
                        >
                            {m === 'editor' ? '✏ Edit' : m === 'split' ? '⊟ Split' : '👁 Preview'}
                        </button>
                    ))}
                </div>
                <div className="w-px h-4 bg-border mx-1" />
                <button onClick={() => navigator.clipboard.writeText(value).then(() => addToast('Copied!', 'success'))}
                    className="text-xs px-2 py-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Copy markdown">⎘</button>
                <button onClick={() => setFindOpen(v => !v)}
                    className={`text-xs px-2 py-1 rounded transition-colors ${findOpen ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`} title="Find & Replace">⌕</button>
                <button onClick={() => value && confirm('Clear all content?') && setValue('')}
                    className="text-xs px-2 py-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Clear">✕</button>
            </div>

            {/* ── Formatting toolbar ── */}
            {mode !== 'preview' && (
                <div className="flex items-center flex-wrap gap-0.5 px-3 py-1 border-b border-border bg-muted/30 flex-shrink-0" role="toolbar" aria-label="Formatting">
                    {TOOLBAR.map((action, idx) => (
                        <span key={idx} className="inline-flex items-center gap-0.5">
                            {action.separator && idx > 0 && <span className="w-px h-4 bg-border mx-1" aria-hidden />}
                            <button
                                className="inline-flex items-center justify-center min-w-[28px] h-6 px-1.5 rounded text-[11px] font-semibold font-mono text-muted-foreground hover:text-foreground hover:bg-background hover:border hover:border-border transition-colors"
                                title={action.shortcut ? `${action.label} (${action.shortcut})` : action.label}
                                aria-label={action.label}
                                onMouseDown={e => { e.preventDefault(); action.action(insertText); }}
                            >
                                {action.icon}
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* ── Find & Replace ── */}
            {findOpen && (
                <div className="flex items-center flex-wrap gap-2 px-3 py-1.5 border-b border-border bg-muted/30 flex-shrink-0">
                    <input
                        value={findVal}
                        onChange={e => setFindVal(e.target.value)}
                        placeholder="Find…"
                        autoFocus
                        className="text-xs font-mono px-2 py-1 border border-border rounded bg-background text-foreground outline-none focus:ring-1 focus:ring-green-600/40 w-36"
                    />
                    <input
                        value={replaceVal}
                        onChange={e => setReplaceVal(e.target.value)}
                        placeholder="Replace with…"
                        className="text-xs font-mono px-2 py-1 border border-border rounded bg-background text-foreground outline-none focus:ring-1 focus:ring-green-600/40 w-44"
                    />
                    <button onClick={handleReplace}
                        className="text-xs px-3 py-1 rounded border border-border bg-background text-foreground hover:bg-muted transition-colors">
                        Replace all
                    </button>
                    {findVal && (
                        <span className="text-xs text-muted-foreground font-mono">{matchCount} match{matchCount !== 1 ? 'es' : ''}</span>
                    )}
                    <button onClick={() => setFindOpen(false)}
                        className="ml-auto text-xs px-2 py-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">✕</button>
                </div>
            )}

            {/* ── Body ── */}
            <div className="flex flex-1 min-h-0 overflow-hidden">

                {/* Editor pane */}
                {(mode === 'editor' || mode === 'split') && (
                    <div className={`flex flex-col flex-1 min-w-0 overflow-hidden ${mode === 'split' ? 'border-r border-border' : ''}`}>
                        <textarea
                            ref={taRef}
                            value={value}
                            onChange={e => setValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onKeyUp={updateCursor}
                            onClick={updateCursor}
                            placeholder={placeholder}
                            spellCheck
                            aria-label="Markdown editor"
                            aria-multiline="true"
                            className="flex-1 w-full p-6 border-none outline-none resize-none font-mono text-[13.5px] leading-relaxed text-foreground bg-background caret-green-600 overflow-y-auto placeholder:text-muted-foreground/50 focus:outline-none"
                        />
                    </div>
                )}

                {/* Preview pane */}
                {(mode === 'preview' || mode === 'split') && (
                    <div className="flex-1 min-w-0 overflow-y-auto p-6">
                        {value.trim()
                            ? <MarkdownRenderer content={value} />
                            : <p className="text-sm text-muted-foreground italic">Nothing to preview yet.</p>
                        }
                    </div>
                )}
            </div>

            {/* ── Status bar ── */}
            <div className="flex items-center gap-4 px-4 h-7 border-t border-border bg-muted/30 flex-shrink-0 text-[11px] font-mono">
                <span className="text-green-600 font-semibold">{words} {words === 1 ? 'word' : 'words'}</span>
                <span className="text-muted-foreground">{countLines(value)} lines</span>
                <span className="text-muted-foreground">{value.length} chars</span>
                <span className="text-muted-foreground">{readTime(words)}</span>
                <span className="flex-1" />
                <span className="text-muted-foreground">Ln {cursor.line}, Col {cursor.col}</span>
                <span className="text-muted-foreground">Markdown</span>
            </div>

            {/* ── Toasts ── */}
            <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50 pointer-events-none">
                {toasts.map(t => (
                    <div key={t.id} className={`px-4 py-2 rounded-lg text-xs font-mono font-medium border animate-in fade-in slide-in-from-bottom-2 duration-150 ${
                        t.type === 'success' ? 'bg-green-600 text-white border-green-700'
                        : t.type === 'error' ? 'bg-red-600 text-white border-red-700'
                        : 'bg-background text-foreground border-border'
                    }`}>
                        {t.message}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MarkdownEditor;