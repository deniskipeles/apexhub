'use client';

import React, { useState } from 'react';
import { apex } from '@/lib/apexkit';
import { LifeBuoy, Play, Loader2, CheckCircle, Terminal, AlertTriangle, Bug, HelpCircle, Code } from 'lucide-react';

export default function HelpPage() {
    const [issueTitle, setIssueTitle] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [sandboxUrl, setSandboxUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleCreateSandbox = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!issueTitle.trim() || !description.trim()) return;

        setLoading(true);
        setError(null);

        try {
            // 1. Create AI Session (Simulates spinning up infrastructure)
            // This endpoint creates the sandbox environment on the server
            const session = await apex.ai.createSession(
                `Help: ${issueTitle}`,
                "Setup basic schema for reproduction",
                "gemini-2.0-flash"
            );
            
            // 2. Save the request record for tracking
            await apex.collection('sandbox_requests').create({
                issue_title: issueTitle,
                description: description,
                sandbox_id: session.id,
                status: 'active'
            });

            // 3. Construct URL
            // Assuming the frontend router handles /sandbox/:id or we link to the admin UI
            // For now, let's link to the Admin UI sandbox view
            // NOTE: In a real deployment, this might be a subdomain or separate route
            // For this demo, we assume the Admin UI is mounted at /_dashboard
            setSandboxUrl(`/_dashboard/sandbox/${session.id}`);

        } catch(err: any) {
            console.error(err);
            setError(err.message || "Failed to provision sandbox. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (sandboxUrl) {
        return (
            <div className="h-[calc(100vh-64px)] flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-8 border border-green-500/20 shadow-xl shadow-green-500/10">
                    <CheckCircle className="text-green-500" size={48} />
                </div>
                <h2 className="text-4xl font-bold text-foreground mb-4">Sandbox Ready!</h2>
                <p className="text-muted text-lg max-w-lg mb-10 leading-relaxed">
                    Your ephemeral ApexKit instance has been provisioned. Use this environment to reproduce your issue and share the link with the community.
                </p>
                
                <div className="bg-surface border border-border p-6 rounded-2xl mb-10 w-full max-w-xl shadow-inner text-left">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase text-muted tracking-widest">Sandbox URL</span>
                        <span className="text-xs text-green-500 font-mono">Active</span>
                    </div>
                    <div className="flex items-center gap-4 font-mono text-sm text-foreground bg-background p-3 rounded-lg border border-border">
                        <Terminal size={16} className="text-primary shrink-0" />
                        <span className="truncate select-all">{typeof window !== 'undefined' ? window.location.origin : ''}{sandboxUrl}</span>
                    </div>
                </div>

                <div className="flex gap-4">
                    <a 
                        href={sandboxUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="px-8 py-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                    >
                        <Code size={20} /> Open Sandbox
                    </a>
                    <button 
                        onClick={() => { setSandboxUrl(null); setIssueTitle(""); setDescription(""); }} 
                        className="px-8 py-4 bg-surface border border-border hover:bg-surface/80 text-foreground font-medium rounded-xl transition-colors"
                    >
                        Create Another
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-12 max-w-4xl mx-auto min-h-screen animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase mb-6">
                    <LifeBuoy size={14} /> Support Center
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                    Community Help & Sandbox
                </h1>
                <p className="text-xl text-muted max-w-2xl mx-auto leading-relaxed">
                    Don't just paste code. <span className="text-foreground font-semibold">Spin up a live environment</span> to verify bugs or demonstrate features instantly.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <div className="bg-surface/30 border border-border rounded-2xl p-6 text-center hover:bg-surface/50 transition-colors">
                    <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 text-red-500"><Bug /></div>
                    <h3 className="font-bold text-foreground mb-2">Report a Bug</h3>
                    <p className="text-sm text-muted">Found something broken? Create a reproduction case.</p>
                </div>
                <div className="bg-surface/30 border border-border rounded-2xl p-6 text-center hover:bg-surface/50 transition-colors">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 text-blue-500"><HelpCircle /></div>
                    <h3 className="font-bold text-foreground mb-2">Ask for Help</h3>
                    <p className="text-sm text-muted">Stuck on a query? Share a sandbox with your schema.</p>
                </div>
                <div className="bg-surface/30 border border-border rounded-2xl p-6 text-center hover:bg-surface/50 transition-colors">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 text-purple-500"><Code /></div>
                    <h3 className="font-bold text-foreground mb-2">Share Code</h3>
                    <p className="text-sm text-muted">Demonstrate a cool pattern or optimization.</p>
                </div>
            </div>

            <div className="bg-surface border border-border rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                
                <h2 className="text-2xl font-bold text-foreground mb-8">Start a Session</h2>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-sm">
                        <AlertTriangle className="shrink-0 mt-0.5" size={18} />
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleCreateSandbox} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-foreground mb-2">Issue Title</label>
                        <input 
                            type="text" 
                            required
                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-muted/50"
                            placeholder="e.g., Relation expansion fails on null values"
                            value={issueTitle}
                            onChange={e => setIssueTitle(e.target.value)}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-foreground mb-2">Description & Reproduction Steps</label>
                        <textarea 
                            required
                            rows={6}
                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none transition-all placeholder:text-muted/50 font-mono text-sm"
                            placeholder="1. Create collection 'users'&#10;2. Add relation field...&#10;3. Observe error..."
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="pt-4 border-t border-border mt-8">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full py-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 hover:shadow-primary/30 transform hover:-translate-y-0.5"
                        >
                            {loading ? (
                                <><Loader2 className="animate-spin" /> Provisioning Environment...</>
                            ) : (
                                <><Play size={20} fill="currentColor" /> Create Reproduction Sandbox</>
                            )}
                        </button>
                        <p className="text-center text-xs text-muted mt-4">
                            This will spin up a temporary t2.micro equivalent instance. Data persists for 24 hours.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}