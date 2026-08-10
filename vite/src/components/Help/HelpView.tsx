import React, { useState, useEffect, useCallback } from 'react';
import { apex } from '@/lib/apexkit';
import { 
    LifeBuoy, Play, Loader2, Terminal, Bug, 
    HelpCircle, Code, Plus, ExternalLink, 
    Monitor, RefreshCw, Box, Copy, Check, Layout, ArrowLeft 
} from 'lucide-react';
import { useRouter, useSearchParams } from '@/lib/navigation';

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

export function HelpView() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [sessions, setSessions] = useState<SandboxRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const activeSessionId = searchParams.get('session');
    const isCreateMode = searchParams.get('mode') === 'new';

    const activeSession = sessions.find(s => s.sandbox_id === activeSessionId);

    const fetchSessions = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await apex.collection('sandbox_requests').list({ 
                sort: '-created', 
                expand: 'created_by',
                per_page: 50 
            });
            
            const mappedSessions: SandboxRequest[] = (res.items || []).map((item: any) => ({
                id: item.id.toString(),
                sandbox_id: item.data?.sandbox_id,
                issue_title: item.data?.issue_title,
                description: item.data?.description,
                status: item.data?.status,
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

    const handleNavigate = (mode: 'new' | 'view' | 'list', id?: string) => {
        const params = new URLSearchParams();
        if (mode === 'new') params.set('mode', 'new');
        if (id && mode === 'view') params.set('session', id);
        router.replace(`/help${params.toString() ? '?' + params.toString() : ''}`);
    };

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden bg-background">
            
            {/* SIDEBAR: Hidden on mobile when creating a new sandbox or viewing a session */}
            <div className={`
                w-full md:w-80 lg:w-96 border-r border-border flex flex-col bg-surface/30 shrink-0
                ${(isCreateMode || activeSession) ? 'hidden md:flex' : 'flex h-full'}
            `}>
                <div className="p-4 border-b border-border flex flex-col gap-3 sm:gap-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold text-base sm:text-lg flex items-center gap-2 text-foreground">
                            <LifeBuoy className="h-5 w-5 text-primary" /> Help Center
                        </h2>
                        <button 
                            type="button"
                            onClick={fetchSessions} 
                            className="p-1.5 hover:bg-background rounded-md text-muted hover:text-foreground transition-colors cursor-pointer"
                        >
                            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
                        </button>
                    </div>
                    <button 
                        type="button"
                        onClick={() => handleNavigate('new')}
                        className={`w-full py-2.5 rounded-xl border font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                            isCreateMode 
                            ? 'bg-primary text-white border-primary shadow-md shadow-primary/20' 
                            : 'bg-background border-border hover:border-primary/50 text-foreground'
                        }`}
                    >
                        <Plus size={16} /> New Sandbox Session
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {isLoading && sessions.length === 0 ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted" /></div>
                    ) : (
                        sessions.map(s => (
                            <button
                                key={s.id}
                                type="button"
                                onClick={() => handleNavigate('view', s.sandbox_id)}
                                className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                                    activeSessionId === s.sandbox_id 
                                    ? 'bg-background border-primary/50 shadow-sm' 
                                    : 'bg-transparent border-transparent hover:bg-background/50 hover:border-border'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${
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

            {/* MAIN CONTENT AREA: On mobile, takes full screen when active */}
            <div className={`
                flex-1 flex-col bg-background/50 backdrop-blur-sm relative overflow-hidden
                ${(isCreateMode || activeSession) ? 'flex h-full' : 'hidden md:flex'}
            `}>
                {isCreateMode ? (
                    <CreateSandboxView 
                        onSuccess={(id) => { 
                            fetchSessions(); 
                            handleNavigate('view', id); 
                        }} 
                        onBack={() => handleNavigate('list')}
                    />
                ) : activeSession ? (
                    <SandboxDetailView 
                        session={activeSession} 
                        onBack={() => handleNavigate('list')}
                    />
                ) : (
                    <EmptyState onNew={() => handleNavigate('new')} />
                )}
            </div>
        </div>
    );
}

function EmptyState({ onNew }: { onNew: () => void }) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 md:p-8 animate-in fade-in zoom-in-95 duration-300 overflow-y-auto">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-surface rounded-full flex items-center justify-center mb-6 border border-border shadow-inner">
                <Box size={40} className="text-muted/30 sm:w-12 sm:h-12" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">No Session Selected</h1>
            <p className="text-xs sm:text-sm text-muted max-w-sm mb-8 leading-relaxed">
                Select an active sandbox from the list to view details and live preview, or start a fresh environment.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full max-w-2xl">
                 {[
                    { icon: Bug, label: "Reproduce Bug", desc: "Isolate issues cleanly." },
                    { icon: HelpCircle, label: "Get Help", desc: "Show, don't just tell." },
                    { icon: Code, label: "Share Code", desc: "Demo your pattern." },
                 ].map((item, i) => (
                     <button type="button" key={i} onClick={onNew} className="p-4 rounded-2xl border border-border bg-surface/50 hover:bg-surface hover:border-primary/30 transition-all text-left group cursor-pointer">
                         <item.icon className="w-6 h-6 sm:w-8 sm:h-8 text-primary mb-2 sm:mb-3 group-hover:scale-110 transition-transform" />
                         <div className="font-bold text-xs sm:text-sm text-foreground">{item.label}</div>
                         <div className="text-[11px] text-muted">{item.desc}</div>
                     </button>
                 ))}
            </div>
        </div>
    );
}

function CreateSandboxView({ onSuccess, onBack }: { onSuccess: (id: string) => void; onBack: () => void }) {
    const [issueTitle, setIssueTitle] = useState("");
    const [description, setDescription] = useState("");
    const [customEmail, setCustomEmail] = useState("");
    const [customPassword, setCustomPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const result = await apex.scripts.run('provision-sandbox', {
                name: `Help: ${issueTitle}`,
                admin_email: customEmail.trim() || undefined,
                admin_password: customPassword.trim() || undefined
            });

            if (!result || !result.sandbox_id) {
                throw new Error("Script did not return a sandbox ID");
            }

            const sandboxId = result.sandbox_id;
            
            await apex.collection('sandbox_requests').create({
                issue_title: issueTitle,
                description: description,
                sandbox_id: sandboxId,
                status: 'open'
            });

            onSuccess(sandboxId.toString());

        } catch (e: any) {
            console.error("Provisioning error:", e);
            setError(e.message || "Failed to provision sandbox. Quota may be exceeded.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-12 custom-scrollbar">
            <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
                
                {/* Mobile Back Button */}
                <button 
                    type="button" 
                    onClick={onBack}
                    className="md:hidden inline-flex items-center gap-2 text-xs font-bold text-muted hover:text-foreground transition-colors cursor-pointer mb-2"
                >
                    <ArrowLeft size={16} /> Back to Sessions List
                </button>

                <div className="flex items-center justify-between">
                    <h2 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2.5 text-foreground tracking-tight">
                        <Terminal className="text-primary w-6 h-6 sm:w-8 sm:h-8" /> New Sandbox
                    </h2>
                </div>
                
                <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-2xl p-5 sm:p-8 shadow-xl space-y-5 sm:space-y-6">
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs sm:text-sm flex items-start gap-2.5">
                            <Bug className="h-5 w-5 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold">Provisioning Failed</p>
                                <p>{error}</p>
                            </div>
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                            Issue / Topic
                        </label>
                        <input 
                            required
                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all"
                            placeholder="e.g. Relation expansion fails on null"
                            value={issueTitle}
                            onChange={e => setIssueTitle(e.target.value)}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                            Details & Context
                        </label>
                        <textarea 
                            required
                            rows={4}
                            className="w-full bg-background border border-border rounded-xl p-4 text-sm text-foreground focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none resize-none font-sans"
                            placeholder="Describe steps to reproduce, query inputs, or expected behavior..."
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>

                    {/* Custom Admin User Credentials */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                                Custom Admin Email (Optional)
                            </label>
                            <input 
                                type="email"
                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all"
                                placeholder="my-admin@company.com"
                                value={customEmail}
                                onChange={e => setCustomEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                                Custom Admin Password (Optional)
                            </label>
                            <input 
                                type="password"
                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all"
                                placeholder="customSecret123!"
                                value={customPassword}
                                onChange={e => setCustomPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-border/80">
                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 sm:py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 text-sm cursor-pointer"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Play size={16} fill="currentColor" />}
                            <span>Provision Sandbox</span>
                        </button>
                        <p className="text-center text-[11px] text-muted mt-3">
                            Max storage limit: 50MB per session. Ephemeral sandboxes auto-expire in 24 hours.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}

function SandboxDetailView({ session, onBack }: { session: SandboxRequest; onBack: () => void }) {
    const [view, setView] = useState<'preview' | 'info'>('preview');
    const [copied, setCopied] = useState(false);

    const targetUrl = `${apex.baseUrl}/_dashboard/sandbox/${session.sandbox_id}/dashboard`;

    const handleCopy = () => {
        navigator.clipboard.writeText(targetUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="min-h-16 border-b border-border bg-background px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                    <button 
                        type="button" 
                        onClick={onBack}
                        className="md:hidden p-1.5 hover:bg-surface rounded-lg text-muted hover:text-foreground transition-colors cursor-pointer"
                        title="Back to list"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div className="min-w-0">
                        <h2 className="font-bold text-foreground truncate max-w-[180px] sm:max-w-xs md:max-w-md text-sm sm:text-base">
                            {session.issue_title}
                        </h2>
                        <div className="flex items-center gap-2 text-[11px] text-muted">
                            <span className="font-mono truncate">{session.sandbox_id}</span>
                            <span className="w-1 h-1 bg-border rounded-full"></span>
                            <span className="text-green-500 flex items-center gap-1 font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Live
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-surface border border-border rounded-lg p-1 gap-1">
                        <button 
                            type="button"
                            onClick={() => setView('preview')}
                            className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                                view === 'preview' ? 'bg-background shadow text-primary' : 'text-muted hover:text-foreground'
                            }`}
                        >
                            <Monitor size={13} /> <span className="hidden sm:inline">Preview</span>
                        </button>
                        <button 
                            type="button"
                            onClick={() => setView('info')}
                            className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                                view === 'info' ? 'bg-background shadow text-primary' : 'text-muted hover:text-foreground'
                            }`}
                        >
                            <Layout size={13} /> <span className="hidden sm:inline">Details</span>
                        </button>
                    </div>

                    <button 
                        type="button" 
                        onClick={handleCopy} 
                        className="p-2 hover:bg-surface rounded-lg text-muted hover:text-foreground transition-colors cursor-pointer" 
                        title="Copy Sandbox URL"
                    >
                        {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    </button>
                    <a 
                        href={targetUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="px-3 py-1.5 bg-primary text-white font-bold text-xs rounded-lg hover:bg-primary-hover flex items-center gap-1.5 transition-all shadow-sm"
                    >
                        <span className="hidden sm:inline">Open Full</span> <ExternalLink size={13} />
                    </a>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-zinc-950 relative overflow-hidden">
                {view === 'preview' ? (
                    <div className="w-full h-full flex flex-col">
                        <div className="h-8 bg-[#1e1e1e] border-b border-[#333] flex items-center px-4 gap-2 text-xs">
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
                    <div className="p-6 sm:p-8 max-w-3xl mx-auto text-zinc-300 overflow-y-auto max-h-full custom-scrollbar">
                        <div className="space-y-6">
                            <div className="bg-surface/10 border border-border/20 rounded-2xl p-6">
                                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Description</h3>
                                <p className="whitespace-pre-wrap leading-relaxed text-sm text-zinc-300">{session.description}</p>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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