import React, { useState } from 'react';
import { Bug, Search, Plus, Loader2, X } from 'lucide-react';
import { apex } from '@/lib/apexkit';
import { Link } from '@/lib/navigation';

export function IssueList({ initialItems }: { initialItems: any[] }) {
  const [items, setItems] = useState(initialItems);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [title, setTitle] = useState("");

  const filteredItems = items.filter(i => i.data?.title?.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim()) return;
      setIsSubmitting(true);

      try {
          const res = await apex.collection('issues').create({
              title
          });
          setItems([res, ...items]);
          setIsCreateOpen(false);
          setTitle("");
      } catch (err: any) { 
          console.error(err);
          alert(err.message || "Failed to create issue. Make sure you are signed in.");
      } finally { 
          setIsSubmitting(false); 
      }
  };

  const getUserName = (record: any) => {
      const u = record.expand?.posted_by_id || record.expand?.author_id;
      return u?.email?.split('@')[0] || 'Community Member';
  };

  return (
    <div>
        <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6 animate-in fade-in">
            <div className="relative flex-1 sm:max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={16} />
                <input 
                    type="text" 
                    placeholder="Search issues..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-foreground focus:ring-2 focus:ring-primary/40 outline-none"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>
            <button 
                type="button" 
                onClick={() => setIsCreateOpen(true)} 
                className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-hover flex items-center justify-center gap-2 whitespace-nowrap shadow-md shadow-primary/20 transition-all cursor-pointer"
            >
                <Plus size={16} /> New Issue
            </button>
        </div>

        <div className="grid gap-4">
            {filteredItems.map(i => (
                <Link key={i.id} href={`/ecosystem/issues/${i.id}`}>
                    <div className="bg-surface border border-border rounded-2xl p-5 hover:border-primary/40 transition-colors flex gap-4 group cursor-pointer">
                        <div className="p-2.5 bg-primary/10 text-primary rounded-xl shrink-0 h-fit">
                            <Bug size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors truncate">
                                {i.data?.title}
                            </h3>
                            <div className="text-xs text-muted flex items-center gap-2 font-mono">
                                <span>#{(i.id + "").substring(0, 8)}</span>
                                <span>•</span>
                                <span>Opened {new Date(i.created).toLocaleDateString()} by {getUserName(i)}</span>
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
            {filteredItems.length === 0 && (
                <div className="text-center py-16 text-muted border border-dashed border-border rounded-2xl bg-surface/30">
                    <Bug size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-foreground">No open issues found</p>
                    <p className="text-xs text-muted mt-1">Submit an issue or feature request.</p>
                </div>
            )}
        </div>

        {isCreateOpen && (
            <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-surface border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl relative animate-in zoom-in-95">
                    <button type="button" onClick={() => setIsCreateOpen(false)} className="absolute top-4 right-4 text-muted hover:text-foreground cursor-pointer"><X size={20} /></button>
                    <h2 className="text-xl font-bold mb-6 text-foreground">Report Issue</h2>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">Issue Title / Summary</label>
                            <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/40 outline-none" placeholder="e.g. Vector index search fails on empty embeddings" />
                        </div>
                        <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all cursor-pointer">
                            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Submit Issue'}
                        </button>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
}