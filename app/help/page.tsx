'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apex } from '@/lib/apexkit';
import { 
    LifeBuoy, Play, Loader2, Terminal, Bug, 
    HelpCircle, Code, Plus, Search, ExternalLink, 
    Monitor, RefreshCw, X, Layout, Box, Copy, Check
} from 'lucide-react';

interface SandboxRequest {
    id: string;
    sandbox_id: string;
    issue_title: string;
    description: string;
    status: 'open' | 'closed';
    created: string;
    expand?: {
        created_by?: { email: string };
    };
}

export default function HelpPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // --- State ---
    const [sessions, setSessions] = useState<SandboxRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    
    // URL-Driven State
    const activeSessionId = searchParams.get('session');
    const isCreateMode = searchParams.get('mode') === 'new';

    const activeSession = sessions.find(s => s.sandbox_id === activeSessionId);

    // --- Actions ---
    
    const fetchSessions = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await apex.collection('sandbox_requests').list({ 
                sort: '-created', 
                expand: 'created_by',
                per_page: 50 
            });
            
            const mappedSessions: SandboxRequest[] = res.items.map((item: any) => ({
                id: item.id.toString(),
                sandbox_id: item.data.sandbox_id,
                issue_title: item.data.issue_title,
                description: item.data.description,
                status: item.data.status,
                created: item.created,
                expand: item.expand
            }));

            setSessions(mappedSessions);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    const handleNavigate = (mode: 'new' | 'view', id?: string) => {
        const params = new URLSearchParams();
        if (mode === 'new') params.set('mode', 'new');
        if (id) params.set('session', id);
        router.replace(`/help?${params.toString()}`);
    };

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-background">
            
            {/* --- LEFT SIDEBAR: LIST --- */}
            <div className="w-full md:w-80 lg:w-96 border-r border-border flex flex-col bg-surface/30">
                {/* Header */}
                <div className="p-4 border-b border-border flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold text-lg flex items-center gap-2">
                            <LifeBuoy className="h-5 w-5 text-primary" /> Help Center
                        </h2>
                        <button 
                            onClick={fetchSessions} 
                            className="p-1.5 hover:bg-background rounded-md text-muted hover:text-foreground transition-colors"
                        >
                            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
                        </button>
                    </div>
                    <button 
                        onClick={() => handleNavigate('new')}
                        className={`w-full py-2.5 rounded-lg border font-medium text-sm flex items-center justify-center gap-2 transition-all ${isCreateMode ? 'bg-primary text-white border-primary shadow-md' : 'bg-background border-border hover:border-primary/50 text-foreground'}`}
                    >
                        <Plus size={16} /> New Sandbox Session
                    </button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {isLoading && sessions.length === 0 ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted" /></div>
                    ) : (
                        sessions.map(s => (
                            <button
                                key={s.id}
                                onClick={() => handleNavigate('view', s.sandbox_id)}
                                className={`w-full text-left p-3 rounded-lg border transition-all group ${
                                    activeSessionId === s.sandbox_id 
                                    ? 'bg-background border-primary/50 shadow-sm' 
                                    : 'bg-transparent border-transparent hover:bg-background/50 hover:border-border'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded border uppercase ${
                                        s.status === 'open' 
                                        ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                                        : 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
                                    }`}>
                                        {s.status}
                                    </span>
                                    <span className="text-[10px] text-muted font-mono">{new Date(s.created).toLocaleDateString()}</span>
                                </div>
                                <h4 className="font-semibold text-sm truncate mb-1 text-foreground">{s.issue_title}</h4>
                                <div className="flex items-center gap-1.5 text-xs text-muted">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                                    <span className="font-mono truncate">{s.sandbox_id}</span>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* --- RIGHT MAIN: CONTENT --- */}
            <div className="flex-1 flex flex-col bg-background/50 backdrop-blur-sm relative overflow-hidden">
                {isCreateMode ? (
                    <CreateSandboxView onSuccess={(id) => { 
                        fetchSessions(); 
                        handleNavigate('view', id); 
                    }} />
                ) : activeSession ? (
                    <SandboxDetailView session={activeSession} />
                ) : (
                    <EmptyState onNew={() => handleNavigate('new')} />
                )}
            </div>
        </div>
    );
}

// --- SUB-VIEWS ---

function EmptyState({ onNew }: { onNew: () => void }) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mb-6 border border-border shadow-inner">
                <Box size={48} className="text-muted/30" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">No Session Selected</h1>
            <p className="text-muted max-w-sm mb-8">
                Select an active sandbox from the list to view details and live preview, or start a fresh environment.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
                 {[
                    { icon: Bug, label: "Reproduce Bug", desc: "Isolate issues cleanly." },
                    { icon: HelpCircle, label: "Get Help", desc: "Show, don't just tell." },
                    { icon: Code, label: "Share Code", desc: "Demo your pattern." },
                 ].map((item, i) => (
                     <button key={i} onClick={onNew} className="p-4 rounded-xl border border-border bg-surface/50 hover:bg-surface hover:border-primary/30 transition-all text-left group">
                         <item.icon className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                         <div className="font-bold text-sm text-foreground">{item.label}</div>
                         <div className="text-xs text-muted">{item.desc}</div>
                     </button>
                 ))}
            </div>
        </div>
    );
}

function CreateSandboxView({ onSuccess }: { onSuccess: (id: string) => void }) {
    const [issueTitle, setIssueTitle] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Call Server-Side Script to Provision Sandbox
            // This script handles the 50MB quota check
            const result = await apex.scripts.run('provision-sandbox', {
                name: `Help: ${issueTitle}`
            });

            if (!result || !result.sandbox_id) {
                throw new Error("Script did not return a sandbox ID");
            }

            const sandboxId = result.sandbox_id;
            
            // 2. Track Metadata in Hub
            await apex.collection('sandbox_requests').create({
                issue_title: issueTitle,
                description: description,
                sandbox_id: sandboxId,
                status: 'open'
            });

            onSuccess(sandboxId.toString());

        } catch (e: any) {
            // Handle Quota Exceeded or other script errors
            console.error("Provisioning error:", e);
            setError(e.message || "Failed to provision sandbox. Quota may be exceeded.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto p-6 md:p-12">
            <div className="max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                    <Terminal className="text-primary" /> New Sandbox
                </h2>
                
                <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-xl p-8 shadow-sm space-y-6">
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm flex items-start gap-2">
                            <Bug className="h-5 w-5 shrink-0" />
                            <div>
                                <p className="font-bold">Provisioning Failed</p>
                                <p>{error}</p>
                            </div>
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-sm font-bold text-foreground mb-2">Issue / Topic</label>
                        <input 
                            required
                            className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                            placeholder="e.g. Relation expansion fails on null"
                            value={issueTitle}
                            onChange={e => setIssueTitle(e.target.value)}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-foreground mb-2">Details</label>
                        <textarea 
                            required
                            rows={5}
                            className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                            placeholder="Describe steps to reproduce..."
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="pt-4 border-t border-border">
                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Play size={18} fill="currentColor" />}
                            Check Quota & Provision
                        </button>
                        <p className="text-center text-xs text-muted mt-4">
                            Limit: 50MB per user. Sandboxes expire in 24 hours.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}

function SandboxDetailView({ session }: { session: SandboxRequest }) {
    const [view, setView] = useState<'preview' | 'info'>('preview');
    const [iframeUrl, setIframeUrl] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Construct URL for the specific sandbox
    // Assuming backend mounts it at /_dashboard/sandbox/{id}
    const targetUrl = `${apex.baseUrl}/_dashboard/sandbox/${session.sandbox_id}/dashboard`;

    const handleCopy = () => {
        navigator.clipboard.writeText(targetUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="h-16 border-b border-border bg-background px-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <div>
                        <h2 className="font-bold text-foreground truncate max-w-xs">{session.issue_title}</h2>
                        <div className="flex items-center gap-2 text-xs text-muted">
                            <span className="font-mono">{session.sandbox_id}</span>
                            <span className="w-1 h-1 bg-border rounded-full"></span>
                            <span className="text-green-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Live</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center bg-surface border border-border rounded-lg p-1 gap-1">
                    <button 
                        onClick={() => setView('preview')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${view === 'preview' ? 'bg-background shadow text-primary' : 'text-muted hover:text-foreground'}`}
                    >
                        <Monitor size={14} /> Preview
                    </button>
                    <button 
                        onClick={() => setView('info')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${view === 'info' ? 'bg-background shadow text-primary' : 'text-muted hover:text-foreground'}`}
                    >
                        <Layout size={14} /> Details
                    </button>
                </div>

                <div className="flex items-center gap-2">
                     <button onClick={handleCopy} className="p-2 hover:bg-surface rounded-lg text-muted hover:text-foreground transition-colors" title="Copy Sandbox URL">
                        {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                    </button>
                    <a href={targetUrl} target="_blank" rel="noreferrer" className="px-4 py-2 bg-primary text-white font-bold text-xs rounded-lg hover:bg-primary-hover flex items-center gap-2">
                        Open Full <ExternalLink size={14} />
                    </a>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-zinc-950 relative overflow-hidden">
                {view === 'preview' ? (
                    <div className="w-full h-full flex flex-col">
                        <div className="h-8 bg-[#1e1e1e] border-b border-[#333] flex items-center px-4 gap-2">
                             <div className="flex gap-1.5">
                                 <div className="w-2.5 h-2.5 rounded-full bg-red-500/20"></div>
                                 <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20"></div>
                                 <div className="w-2.5 h-2.5 rounded-full bg-green-500/20"></div>
                             </div>
                             <div className="ml-4 bg-black/40 px-3 py-0.5 rounded text-[10px] font-mono text-zinc-500 flex-1 truncate text-center">
                                 {targetUrl}
                             </div>
                        </div>
                        <iframe 
                            src={targetUrl} 
                            className="flex-1 w-full h-full border-0 bg-white"
                            title="Sandbox Preview"
                        />
                    </div>
                ) : (
                    <div className="p-8 max-w-3xl mx-auto text-zinc-300">
                        <div className="space-y-6">
                            <div className="bg-surface/10 border border-border/20 rounded-xl p-6">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Description</h3>
                                <p className="whitespace-pre-wrap leading-relaxed text-sm">{session.description}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-surface/10 border border-border/20 rounded-xl p-4">
                                    <div className="text-xs text-muted mb-1">Created By</div>
                                    <div className="text-sm font-bold text-white">{session.expand?.created_by?.email || 'Unknown'}</div>
                                </div>
                                <div className="bg-surface/10 border border-border/20 rounded-xl p-4">
                                    <div className="text-xs text-muted mb-1">Created At</div>
                                    <div className="text-sm font-bold text-white">{new Date(session.created).toLocaleString()}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}