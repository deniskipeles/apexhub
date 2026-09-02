import React, { useState, useEffect } from 'react';
import { apex, getFileUrl } from '@/lib/apexkit';
import { X, FileCode, FileJson, Folder, Archive, Loader2, Download, AlertCircle } from 'lucide-react';

interface Props {
    item: any;
    onClose: () => void;
}

export function FileExplorerModal({ item, onClose }: Props) {
    const [content, setContent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const filename = item?.data?.file || item?.file;
    const title = item?.data?.title || item?.title || 'File Preview';
    const itemType = item?.data?.type || item?.type;

    useEffect(() => {
        const fetchContent = async () => {
            if (!filename) {
                setError("No file associated with this asset.");
                setLoading(false);
                return;
            }

            try {
                const isZip = filename.endsWith('.zip') || itemType === 'site' || itemType === 'starter';

                // Call the unified Hono webhook endpoint
                const res = await apex.webhook('api-files').post('/inspect', {
                    filename,
                    is_zip: isZip,
                });

                if (res?.error) {
                    throw new Error(res.error);
                }

                setContent(res);
            } catch (err: any) {
                console.warn("Inspection failed:", err);
                setError(err.message || "Preview unavailable. Download to view.");
            } finally {
                setLoading(false);
            }
        };

        if (item) fetchContent();
    }, [item, filename, itemType]);

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center h-64 text-muted gap-3">
                    <Loader2 className="animate-spin text-primary" size={32} />
                    <span className="text-xs font-mono">Inspecting file contents...</span>
                </div>
            );
        }
        
        if (error) {
            return (
                <div className="flex flex-col items-center justify-center h-64 text-muted gap-3 bg-secondary/10 rounded-xl border border-dashed border-border m-4">
                    <AlertCircle size={32} className="text-amber-500" />
                    <p className="text-sm font-medium">{error}</p>
                    <p className="text-xs opacity-60 max-w-xs text-center">
                        Ensure the 'api-files' webhook is synced to the server.
                    </p>
                </div>
            );
        }

        if (!content) return null;

        // 1. Render ZIP Archive Explorer
        if (content.is_archive || (content.files && Array.isArray(content.files))) {
            const fileList = content.files || [];
            const totalSizeKb = ((content.total_size || 0) / 1024).toFixed(2);
            const count = content.file_count || fileList.length;

            return (
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-secondary/10 text-xs text-muted font-mono">
                        <span>Total Archive Size: {totalSizeKb} KB</span>
                        <span>{count} Files & Folders</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
                        {fileList.map((f: any, idx: number) => (
                            <div 
                                key={idx} 
                                className="flex items-center gap-3 p-2 hover:bg-secondary/20 rounded-lg transition-colors group text-xs"
                            >
                                {f.is_dir ? (
                                    <Folder size={16} className="text-blue-400 shrink-0" />
                                ) : (
                                    <FileCode size={16} className="text-muted shrink-0" />
                                )}
                                <span className={`font-mono truncate ${f.is_dir ? 'font-bold text-foreground' : 'text-foreground/80'}`}>
                                    {f.name}
                                </span>
                                <span className="ml-auto text-muted font-mono opacity-50 group-hover:opacity-100 shrink-0">
                                    {f.size ? `${(f.size / 1024).toFixed(1)} KB` : (f.is_dir ? 'dir' : '0 B')}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        // 2. Render Formatted Code / JSON / Text File
        const textToDisplay = content.json 
            ? JSON.stringify(content.json, null, 2) 
            : (content.content || (typeof content === 'string' ? content : JSON.stringify(content, null, 2)));
        
        return (
            <div className="h-full bg-[#1e1e1e] overflow-auto p-4 font-mono text-xs text-blue-100 custom-scrollbar">
                <pre className="leading-relaxed">{textToDisplay}</pre>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface border border-border rounded-2xl w-full max-w-3xl h-[80vh] flex flex-col shadow-2xl relative animate-in zoom-in-95 overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-border bg-background">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 bg-primary/10 rounded-xl text-primary shrink-0">
                            {filename?.endsWith('.zip') || itemType === 'site' || itemType === 'starter' ? (
                                <Archive size={20} />
                            ) : filename?.endsWith('.json') ? (
                                <FileJson size={20} />
                            ) : (
                                <FileCode size={20} />
                            )}
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-bold text-foreground truncate">{title}</h3>
                            <p className="text-xs text-muted font-mono truncate">{filename}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {filename && (
                            <a 
                                href={getFileUrl(filename)} 
                                download 
                                className="p-2 hover:bg-secondary rounded-xl text-muted hover:text-foreground transition-colors"
                                title="Download File"
                            >
                                <Download size={18} />
                            </a>
                        )}
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-colors cursor-pointer"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden relative bg-background">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}