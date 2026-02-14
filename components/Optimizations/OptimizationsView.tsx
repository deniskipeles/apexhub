'use client';

import React, { useState } from 'react';
import { 
    TrendingUp, ArrowUp, ArrowDown, Tag, Plus, MessageSquare, User, 
    Loader2, X, CheckCircle2, Trash2, Edit2
} from 'lucide-react';
import { apex, getFileUrl } from '@/lib/apexkit';
import { RealtimeChat } from '../Community/RealtimeChat';

interface Props {
    initialStrategies: any[];
    currentUser?: any; // Pass { id: 1, role: 'admin' } from page.tsx
}

export function OptimizationsView({ initialStrategies, currentUser }: Props) {
    const [strategies, setStrategies] = useState(initialStrategies);
    
    // UI State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingStrat, setEditingStrat] = useState<any | null>(null);
    const [activeDiscussion, setActiveDiscussion] = useState<any | null>(null);
    
    // Form State
    const [formTitle, setFormTitle] = useState("");
    const [formContent, setFormContent] = useState("");
    const [formTags, setFormTags] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- ACTIONS ---

    const handleVote = async (strat: any, type: 'up' | 'down', e: React.MouseEvent) => {
        e.stopPropagation();
        
        // Optimistic UI update (optional, but complex with up/down logic, so we wait for server usually)
        // For responsiveness, let's just trigger the call:
        try {
            const res = await apex.scripts.run('vote-optimization', {
                optimization_id: strat.id,
                type
            });

            // Update local state with new counts from server
            setStrategies(prev => prev.map(s => s.id === strat.id ? {
                ...s,
                data: { 
                    ...s.data, 
                    upvotes: res.upvotes, 
                    downvotes: res.downvotes 
                }
            } : s));

        } catch (err: any) {
            alert(err.message || "Failed to vote. Ensure you are logged in.");
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this strategy?")) return;
        
        try {
            await apex.collection('optimizations').delete(id);
            setStrategies(prev => prev.filter(s => s.id !== id));
            if (activeDiscussion?.id === id) setActiveDiscussion(null);
        } catch (e) {
            alert("Failed to delete. You might not have permission.");
        }
    };

    const openEdit = (strat: any, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingStrat(strat);
        setFormTitle(strat.data.title);
        setFormContent(strat.data.content);
        setFormTags(strat.data.tags?.join(', ') || "");
        setIsCreateOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const tagsArray = formTags.split(',').map(t => t.trim()).filter(Boolean);
            const payload = {
                title: formTitle,
                content: formContent,
                tags: tagsArray,
            };

            if (editingStrat) {
                const res = await apex.collection('optimizations').update(editingStrat.id, payload);
                // Expand author manually to keep UI consistent without refetch
                res.expand = editingStrat.expand; 
                setStrategies(prev => prev.map(s => s.id === editingStrat.id ? res : s));
            } else {
                const res = await apex.collection('optimizations').create({
                    ...payload,
                    upvotes: 0,
                    downvotes: 0
                });
                // Inject current user as author for immediate display
                if (currentUser) {
                    res.expand = { author_id: { email: currentUser.email, ...currentUser } };
                }
                setStrategies([res, ...strategies]);
            }
            
            setIsCreateOpen(false);
            setEditingStrat(null);
            setFormTitle(""); setFormContent(""); setFormTags("");
        } catch (e) {
            console.error(e);
            alert("Failed to save. Check your inputs.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getAuthor = (strat: any) => {
        const u = strat.expand?.author_id;
        return {
            id: u?.id,
            name: u?.email?.split('@')[0] || 'Anonymous',
            avatar: u?.metadata?.avatar ? getFileUrl(u.metadata.avatar) : null
        };
    };

    return (
        <div className="flex h-full min-h-screen relative">
            
            {/* MAIN CONTENT AREA */}
            <div className={`flex-1 transition-all duration-300 ${activeDiscussion ? 'hidden lg:block lg:mr-[400px]' : ''}`}>
                
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6 border-b border-border pb-8">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase">
                            <TrendingUp size={14} /> Performance Lab
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">Optimization Strategies</h1>
                        <p className="text-muted text-lg max-w-xl">
                            Squeeze every drop of performance from your stack.
                        </p>
                    </div>
                    <button 
                        onClick={() => { setEditingStrat(null); setFormTitle(""); setFormContent(""); setFormTags(""); setIsCreateOpen(true); }}
                        className="px-6 py-3 bg-primary text-white font-bold rounded-xl flex items-center gap-2 hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 whitespace-nowrap group"
                    >
                        <Plus size={20} className="group-hover:rotate-90 transition-transform" /> Share Strategy
                    </button>
                </div>

                {/* List */}
                <div className="flex flex-col gap-6">
                    {strategies.map((strat: any) => {
                        const author = getAuthor(strat);
                        // Check if current user is author or admin
                        const isOwner = currentUser && (String(currentUser.id) === String(author.id) || currentUser.role === 'admin');

                        return (
                            <div 
                                key={strat.id} 
                                onClick={() => setActiveDiscussion(strat)}
                                className={`group relative bg-surface/30 border border-border rounded-2xl p-6 hover:bg-surface/50 transition-all cursor-pointer overflow-hidden ${activeDiscussion?.id === strat.id ? 'ring-2 ring-primary border-transparent' : ''}`}
                            >
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                
                                <div className="flex gap-6">
                                    {/* Vote Controls */}
                                    <div className="flex flex-col items-center gap-2 min-w-[50px] bg-background/50 rounded-xl p-2 border border-border/50 h-fit">
                                        <button 
                                            onClick={(e) => handleVote(strat, 'up', e)}
                                            className="p-1.5 rounded-lg hover:bg-green-500/10 text-muted hover:text-green-500 transition-colors"
                                            title="Upvote"
                                        >
                                            <ArrowUp size={20} />
                                        </button>
                                        <span className="font-bold text-sm text-foreground">
                                            {(strat.data.upvotes || 0) - (strat.data.downvotes || 0)}
                                        </span>
                                        <button 
                                            onClick={(e) => handleVote(strat, 'down', e)}
                                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-500 transition-colors"
                                            title="Downvote"
                                        >
                                            <ArrowDown size={20} />
                                        </button>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="text-2xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                                                {strat.data.title}
                                            </h3>
                                            
                                            {isOwner && (
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={(e) => openEdit(strat, e)} className="p-2 bg-background border border-border rounded-lg text-muted hover:text-foreground hover:border-primary/50 transition-all" title="Edit">
                                                        <Edit2 size={14}/>
                                                    </button>
                                                    <button onClick={(e) => handleDelete(strat.id, e)} className="p-2 bg-background border border-border rounded-lg text-muted hover:text-red-500 hover:border-red-500/50 transition-all" title="Delete">
                                                        <Trash2 size={14}/>
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {strat.data.tags?.map((tag: string) => (
                                                <span key={tag} className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-background border border-border text-muted">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="text-muted line-clamp-3 mb-6 font-mono text-sm leading-relaxed opacity-80 whitespace-pre-line">
                                            {strat.data.content}
                                        </div>

                                        <div className="flex items-center justify-between border-t border-border/50 pt-4">
                                            <div className="flex items-center gap-3">
                                                {author.avatar ? (
                                                    <img src={author.avatar} className="w-6 h-6 rounded-full border border-border object-cover" alt="" />
                                                ) : (
                                                    <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[10px]"><User size={12}/></div>
                                                )}
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-foreground">{author.name}</span>
                                                    <span className="text-[10px] text-muted">{new Date(strat.created).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-medium text-primary hover:underline">
                                                <MessageSquare size={14} /> Open Discussion
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    
                    {strategies.length === 0 && (
                        <div className="text-center py-20 text-muted border border-dashed border-border rounded-xl">
                            No strategies shared yet. Be the first!
                        </div>
                    )}
                </div>
            </div>

            {/* DISCUSSION SLIDE-OVER (Desktop) / FULLSCREEN (Mobile) */}
            {activeDiscussion && (
                <div className="fixed inset-y-0 right-0 w-full lg:w-[400px] bg-background border-l border-border shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
                    <div className="flex items-center justify-between p-4 border-b border-border bg-surface/50 backdrop-blur-md">
                        <h3 className="font-bold truncate pr-4">Discussion</h3>
                        <button onClick={() => setActiveDiscussion(null)} className="p-2 hover:bg-surface rounded-lg"><X size={18} /></button>
                    </div>

                    <div className="flex-1 overflow-hidden relative">
                        {/* Scrollable Container */}
                        <div className="absolute inset-0 flex flex-col">
                            {/* Original Post Context */}
                            <div className="p-4 border-b border-border bg-secondary/5 shrink-0 max-h-[200px] overflow-y-auto">
                                <h4 className="font-bold text-sm mb-2">{activeDiscussion.data.title}</h4>
                                <p className="text-xs text-muted font-mono whitespace-pre-wrap">{activeDiscussion.data.content}</p>
                            </div>

                            {/* Chat Component */}
                            <div className="flex-1 relative">
                                <RealtimeChat 
                                    parentId={activeDiscussion.id}
                                    parentData={activeDiscussion}
                                    initialComments={[]} // Empty initially, chat component fetches or subscribes
                                    collectionName="discussions_conversations" // Reuse existing collection or create 'optimization_comments'
                                    parentField="discussion_id" // Reuse discussion logic or add 'optimization_id' to schema
                                    channel={`opt_${activeDiscussion.id}`}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CREATE/EDIT MODAL */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-surface border border-border rounded-2xl p-8 max-w-2xl w-full shadow-2xl relative animate-in zoom-in-95">
                        <button onClick={() => setIsCreateOpen(false)} className="absolute top-4 right-4 text-muted hover:text-foreground"><X /></button>
                        
                        <h2 className="text-2xl font-bold text-foreground mb-6">
                            {editingStrat ? 'Edit Strategy' : 'Share Optimization'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-muted mb-2">Title</label>
                                <input 
                                    required 
                                    value={formTitle} 
                                    onChange={e => setFormTitle(e.target.value)} 
                                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground focus:ring-2 focus:ring-primary focus:outline-none" 
                                    placeholder="e.g. Indexing JSON Arrays" 
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-muted mb-2">Technique (Markdown)</label>
                                <textarea 
                                    required 
                                    rows={8} 
                                    value={formContent} 
                                    onChange={e => setFormContent(e.target.value)} 
                                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground focus:ring-2 focus:ring-primary focus:outline-none font-mono text-sm resize-none" 
                                    placeholder="Describe the optimization..." 
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-muted mb-2">Tags</label>
                                <input 
                                    value={formTags} 
                                    onChange={e => setFormTags(e.target.value)} 
                                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground focus:ring-2 focus:ring-primary focus:outline-none" 
                                    placeholder="sql, cache, rust" 
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setIsCreateOpen(false)} className="flex-1 py-3 bg-surface hover:bg-surface/80 border border-border text-foreground font-bold rounded-xl transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover flex items-center justify-center gap-2 disabled:opacity-50">
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={18} /> {editingStrat ? 'Update' : 'Publish'}</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}