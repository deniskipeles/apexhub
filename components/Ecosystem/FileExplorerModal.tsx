'use client';

import React, { useState, useEffect } from 'react';
import { apex } from '@/lib/apexkit';
import { X, FileCode, FileJson, Folder, Archive, Loader2, Download, AlertCircle } from 'lucide-react';

interface Props {
    item: any; // The ecosystem item record
    onClose: () => void;
}

export function FileExplorerModal({ item, onClose }: Props) {
    const [content, setContent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                // 1. We need to call a server script to inspect this specific file.
                // We use the public run endpoint.
                // NOTE: Requires 'inspect-ecosystem-file' script to exist in backend.
                
                // Fallback: If script isn't there, we just show download button.
                // But let's try to inspect.
                const filename = item.data.file;
                const isZip = filename.endsWith('.zip') || item.data.type === 'site';

                const scriptName = isZip ? 'inspect-archive' : 'read-file';
                
                // Construct the payload for the script
                const payload = { filename };

                const res = await apex.scripts.run(scriptName, payload);
                setContent(res);
            } catch (err: any) {
                console.warn("Inspection failed (Script might be missing):", err);
                setError("Preview unavailable. Download to view.");
            } finally {
                setLoading(false);
            }
        };

        if (item) fetchContent();
    }, [item]);

    // Render Logic
    const renderContent = () => {
        if (loading) return <div className="flex flex-col items-center justify-center h-64 text-muted gap-3"><Loader2 className="animate-spin" size={32} /><span>Inspecting file...</span></div>;
        
        if (error) return (
            <div className="flex flex-col items-center justify-center h-64 text-muted gap-3 bg-secondary/10 rounded-xl border border-dashed border-border m-4">
                <AlertCircle size={32} />
                <p>{error}</p>
                <p className="text-xs opacity-60 max-w-xs text-center">
                    Note: Ensure 'inspect-archive' or 'read-file' script is active on the server.
                </p>
            </div>
        );

        if (!content) return null;

        // ZIP INSPECTION RESULT
        if (content.files && Array.isArray(content.files)) {
            return (
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary/10 text-xs text-muted font-mono">
                        <span>Total Size: {(content.total_size / 1024).toFixed(2)} KB</span>
                        <span>Files: {content.file_count}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2">
                        {content.files.map((f: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-3 p-2 hover:bg-secondary/20 rounded-md transition-colors group">
                                {f.is_dir ? <Folder size={16} className="text-blue-400" /> : <FileCode size={16} className="text-muted" />}
                                <span className={`text-sm font-mono ${f.is_dir ? 'font-bold' : ''}`}>{f.name}</span>
                                <span className="ml-auto text-xs text-muted opacity-50 group-hover:opacity-100">{f.size} B</span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        // TEXT/JSON FILE RESULT
        // Assuming the script returns { content: "string" } or the raw object
        const textContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
        
        return (
            <div className="h-full bg-[#1e1e1e] overflow-auto p-4 font-mono text-xs text-blue-100">
                <pre>{textContent}</pre>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface border border-border rounded-xl w-full max-w-3xl h-[80vh] flex flex-col shadow-2xl relative animate-in zoom-in-95 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border bg-background">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            {item.data.type === 'site' ? <Archive size={20} /> : <FileJson size={20} />}
                        </div>
                        <div>
                            <h3 className="font-bold text-foreground">{item.data.title}</h3>
                            <p className="text-xs text-muted font-mono">{item.data.file}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                         <a 
                            href={apex.files.getFileUrl(item.data.file)} 
                            download 
                            className="p-2 hover:bg-secondary rounded-lg text-muted hover:text-foreground transition-colors"
                            title="Download"
                        >
                            <Download size={20} />
                        </a>
                        <button onClick={onClose} className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-hidden relative bg-background">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}