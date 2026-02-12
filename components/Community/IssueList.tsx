'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Bug, Lightbulb, ThumbsUp, Search, Plus, Loader2, X 
} from 'lucide-react';
import { apex } from '@/lib/apexkit';

export function IssueList({ initialItems }: { initialItems: any[] }) {
  const [items, setItems] = useState(initialItems);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Create Form
  const [title, setTitle] = useState("");
  const [type, setType] = useState("bug");
  const [desc, setDesc] = useState("");

  const filteredItems = items.filter(i => i.data.title.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
          const res = await apex.collection('issues').create({
              title,
              type,
              description: desc, // Assuming description field exists
              status: 'open',
              upvotes: 0,
              tags: ['triage']
          });
          setItems([res, ...items]);
          setIsCreateOpen(false);
          setTitle("");
          setDesc("");
      } catch (err) { console.error(err); } 
      finally { setIsSubmitting(false); }
  };

  const getUserName = (record: any) => record.expand?.author_id?.email?.split('@')[0] || 'User';

  return (
    <div>
        <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
            <div className="relative flex-1 sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                <input 
                    type="text" 
                    placeholder="Search issues..." 
                    className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-lg text-sm text-foreground focus:ring-1 focus:ring-primary outline-none"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>
            <button onClick={() => setIsCreateOpen(true)} className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-hover flex items-center gap-2 whitespace-nowrap shadow-sm transition-colors">
                <Plus size={16} /> New Issue
            </button>
        </div>

        <div className="grid gap-4">
            {filteredItems.map(i => (
                <Link key={i.id} href={`/community/issues/${i.id}`}>
                    <div className="bg-surface border border-border rounded-xl p-5 hover:border-primary/40 transition-colors flex gap-4 group cursor-pointer">
                        <div className="flex flex-col items-center gap-1 min-w-[50px] pt-1">
                            <div className="text-muted group-hover:text-primary transition-colors p-1 rounded hover:bg-surface/80">
                                <ThumbsUp size={20} />
                            </div>
                            <span className="text-sm font-bold text-foreground">{i.data.upvotes || 0}</span>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    {i.data.type === 'bug' ? <Bug size={16} className="text-red-500"/> : <Lightbulb size={16} className="text-yellow-500"/>}
                                    <span className="text-xs font-bold uppercase text-muted">{i.data.type}</span>
                                </div>
                                <div className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${
                                    i.data.status === 'open' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
                                }`}>
                                    {i.data.status}
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{i.data.title}</h3>
                            <div className="flex items-center gap-2 mb-3">
                                {i.data.tags?.map((tag: string) => (
                                    <span key={tag} className="text-[10px] bg-background border border-border px-2 py-0.5 rounded text-muted uppercase tracking-wider font-bold">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <div className="text-xs text-muted flex items-center gap-1">
                                #{(i?.id+"")?.substring(0,8)} opened on {new Date(i.created).toLocaleDateString()} by {getUserName(i)}
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
            {filteredItems.length === 0 && <div className="text-center py-12 text-muted">No issues found.</div>}
        </div>

        {isCreateOpen && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-surface border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl relative animate-in zoom-in-95">
                    <button onClick={() => setIsCreateOpen(false)} className="absolute top-4 right-4 text-muted hover:text-foreground"><X /></button>
                    <h2 className="text-xl font-bold mb-6">New Issue</h2>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-muted mb-2">Title</label>
                            <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-background border border-border rounded-lg px-4 py-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted mb-2">Type</label>
                            <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-background border border-border rounded-lg px-4 py-2">
                                <option value="bug">Bug Report</option>
                                <option value="feature">Feature Request</option>
                            </select>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-muted mb-2">Description</label>
                             <textarea required rows={4} value={desc} onChange={e => setDesc(e.target.value)} className="w-full bg-background border border-border rounded-lg px-4 py-2 resize-none" placeholder="Describe the issue..." />
                        </div>
                        <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover flex items-center justify-center gap-2">
                            {isSubmitting ? <Loader2 className="animate-spin" /> : 'Submit Issue'}
                        </button>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
}