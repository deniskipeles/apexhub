'use client';

import React, { useState } from 'react';
import { TrendingUp, ArrowUp, Tag, Plus, MessageSquare, User, Loader2, X, CheckCircle2 } from 'lucide-react';
import { apex, getFileUrl } from '@/lib/apexkit';

interface Props {
    initialStrategies: any[];
}

export function OptimizationsView({ initialStrategies }: Props) {
    const [strategies, setStrategies] = useState(initialStrategies);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    
    // Form State
    const [newTitle, setNewTitle] = useState("");
    const [newContent, setNewContent] = useState("");
    const [newTags, setNewTags] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const tagsArray = newTags.split(',').map(t => t.trim()).filter(Boolean);
            
            const res = await apex.collection('optimizations').create({
                title: newTitle,
                content: newContent,
                tags: tagsArray,
                upvotes: 0,
            });
            
            setStrategies([res, ...strategies]);
            setIsCreateOpen(false);
            setNewTitle("");
            setNewContent("");
            setNewTags("");
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getAuthor = (strat: any) => {
        const u = strat.expand?.author_id;
        return {
            name: u?.email?.split('@')[0] || 'Anonymous',
            avatar: u?.metadata?.avatar ? getFileUrl(u.metadata.avatar) : null
        };
    };

    return (
        <div>
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6 border-b border-border pb-8">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase">
                        <TrendingUp size={14} /> Performance Lab
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">Optimization Strategies</h1>
                    <p className="text-muted text-lg max-w-xl">
                        Community-sourced tuning and performance tricks for squeezing every drop of speed out of ApexKit.
                    </p>
                </div>
                <button 
                    onClick={() => setIsCreateOpen(true)}
                    className="px-6 py-3 bg-primary text-white font-bold rounded-xl flex items-center gap-2 hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 whitespace-nowrap group"
                >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform" /> Submit Strategy
                </button>
            </div>

            {/* List */}
            <div className="space-y-6">
                {strategies.map((strat: any) => {
                    const author = getAuthor(strat);
                    return (
                        <div 
                            key={strat.id} 
                            className="bg-surface/40 border border-border rounded-2xl p-6 md:p-8 flex flex-col sm:flex-row gap-8 hover:bg-surface/60 hover:border-primary/30 transition-all cursor-pointer group shadow-sm hover:shadow-xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-primary/0 group-hover:bg-primary transition-colors"></div>

                            {/* Vote Side */}
                            <div className="flex flex-row sm:flex-col items-center justify-center gap-3 sm:gap-1 min-w-[70px] sm:border-r border-border/50 sm:pr-8">
                                <button className="p-3 rounded-xl bg-background border border-border hover:border-primary hover:text-primary transition-all shadow-sm hover:shadow-md">
                                    <ArrowUp size={24} />
                                </button>
                                <span className="font-bold text-2xl text-foreground tabular-nums tracking-tight">{strat.data.upvotes || 0}</span>
                            </div>
                            
                            {/* Content Side */}
                            <div className="flex-1 min-w-0 space-y-4">
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors break-words leading-tight">
                                        {strat.data.title}
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {strat.data.tags?.map((tag: string) => (
                                            <span key={tag} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/5 border border-primary/10 text-[10px] font-bold uppercase tracking-wider text-primary/80">
                                                <Tag size={10} /> {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="bg-background/50 rounded-xl p-4 border border-border/50 text-muted text-sm leading-relaxed font-mono whitespace-pre-wrap max-h-40 overflow-hidden relative">
                                    {strat.data.content}
                                    <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-background to-transparent"></div>
                                </div>
                                
                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex items-center gap-3">
                                        {author.avatar ? (
                                            <img src={author.avatar} className="w-8 h-8 rounded-full border border-border" alt="" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center border border-border">
                                                <User size={14} className="text-muted" />
                                            </div>
                                        )}
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-foreground">{author.name}</span>
                                            <span className="text-[10px] text-muted uppercase tracking-wider font-semibold">Contributor</span>
                                        </div>
                                    </div>
                                    <button className="flex items-center gap-2 text-xs font-medium text-muted hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-surface border border-transparent hover:border-border">
                                        <MessageSquare size={14} />
                                        <span>Discuss</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {strategies.length === 0 && (
                    <div className="text-center py-24 bg-surface/20 border border-dashed border-border rounded-3xl">
                        <TrendingUp size={64} className="mx-auto text-muted/20 mb-6" />
                        <h3 className="text-xl font-bold text-foreground mb-2">No strategies yet</h3>
                        <p className="text-muted max-w-sm mx-auto mb-8">
                            Be the first to share your performance tuning secrets with the community.
                        </p>
                        <button onClick={() => setIsCreateOpen(true)} className="px-6 py-2 bg-surface border border-border hover:border-primary text-foreground rounded-lg transition-colors font-medium text-sm">
                            Submit a Tip
                        </button>
                    </div>
                )}
            </div>
            
            <div className="mt-16 text-center">
                <p className="text-sm text-muted">
                    Found {strategies.length} optimization guides.
                </p>
            </div>

            {/* Create Modal */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-surface border border-border rounded-2xl p-8 max-w-2xl w-full shadow-2xl relative animate-in zoom-in-95">
                        <button onClick={() => setIsCreateOpen(false)} className="absolute top-4 right-4 text-muted hover:text-foreground"><X /></button>
                        
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-foreground mb-2">Share a Strategy</h2>
                            <p className="text-muted">Help others scale their applications.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-muted mb-2">Title</label>
                                <input 
                                    required 
                                    value={newTitle} 
                                    onChange={e => setNewTitle(e.target.value)} 
                                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground focus:ring-2 focus:ring-primary focus:outline-none placeholder:text-muted/50" 
                                    placeholder="e.g. Optimizing Vector Search Latency" 
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-muted mb-2">Details (Markdown)</label>
                                <textarea 
                                    required 
                                    rows={8} 
                                    value={newContent} 
                                    onChange={e => setNewContent(e.target.value)} 
                                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground focus:ring-2 focus:ring-primary focus:outline-none font-mono text-sm resize-none placeholder:text-muted/50" 
                                    placeholder="Explain your configuration or code changes..." 
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-muted mb-2">Tags</label>
                                <input 
                                    value={newTags} 
                                    onChange={e => setNewTags(e.target.value)} 
                                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground focus:ring-2 focus:ring-primary focus:outline-none placeholder:text-muted/50" 
                                    placeholder="Comma separated (e.g. sqlite, performance, cache)" 
                                />
                            </div>

                            <div className="flex gap-4 pt-2">
                                <button type="button" onClick={() => setIsCreateOpen(false)} className="flex-1 py-3 bg-surface hover:bg-surface/80 border border-border text-foreground font-bold rounded-lg transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover flex items-center justify-center gap-2 disabled:opacity-50">
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={18} /> Submit</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}