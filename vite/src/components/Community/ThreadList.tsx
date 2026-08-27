import React, { useState } from 'react';
import { MessageCircle, Bug, Clock, Search, Plus, Loader2, X } from 'lucide-react';
import { apex, getFileUrl } from '@/lib/apexkit';
import { Link } from '@/lib/navigation';

export function ThreadList({ initialItems, threadType }: { initialItems: any[], threadType: 'discussion' | 'issue' }) {
  const [items, setItems] = useState(initialItems);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const filteredItems = items.filter(d => 
      d.title?.toLowerCase().includes(search.toLowerCase()) ||
      d.content?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
          const res = await apex.webhook('api-community').post('/ecosystem/threads', {
              title,
              content,
              type: threadType
          });
          if (res && res.success) {
              setItems([res.item, ...items]);
          }
          setIsCreateOpen(false);
          setTitle(""); setContent("");
      } catch (err: any) {
          alert(err.message || "Failed to create thread. Ensure you have a Profile.");
      } finally {
          setIsSubmitting(false);
      }
  };

  const isIssue = threadType === 'issue';

  return (
    <div>
        <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6 animate-in fade-in">
            <div className="relative flex-1 sm:max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={16} />
                <input 
                    type="text" 
                    placeholder={`Search ${threadType}s...`}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/40"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>
            <button onClick={() => setIsCreateOpen(true)} className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-hover flex items-center justify-center gap-2 shadow-md cursor-pointer">
                <Plus size={16} /> New {isIssue ? 'Issue' : 'Discussion'}
            </button>
        </div>

        <div className="grid gap-4">
            {filteredItems.map(d => (
                <Link key={d.id} href={`/ecosystem/${threadType}s/${d.id}`}>
                    <div className="bg-surface border border-border rounded-2xl p-5 hover:border-primary/40 transition-all flex gap-4 group hover:shadow-lg">
                        <div className="p-2.5 bg-primary/10 text-primary rounded-xl shrink-0 h-fit">
                            {isIssue ? <Bug size={20} /> : <MessageCircle size={20} />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${d.status === 'closed' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                    {d.status || 'Open'}
                                </span>
                                <span className="text-xs text-muted flex items-center gap-1 font-mono">
                                    <Clock size={12} /> {new Date(d.created).toLocaleDateString()}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors truncate">
                                {d.title}
                            </h3>
                            <p className="text-sm text-muted line-clamp-2 leading-relaxed mb-3">
                                {d.content}
                            </p>
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold border border-primary/20 text-primary overflow-hidden">
                                    {d.author_avatar ? <img src={getFileUrl(d.author_avatar)} className="w-full h-full object-cover" alt="" /> : d.author_username[0]?.toUpperCase()}
                                </div>
                                <span className="text-xs text-muted">By <span className="text-foreground font-semibold">{d.author_username}</span></span>
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
            {filteredItems.length === 0 && (
                <div className="text-center py-16 text-muted border border-dashed border-border rounded-2xl bg-surface/30">
                    {isIssue ? <Bug size={32} className="mx-auto mb-2 opacity-40" /> : <MessageCircle size={32} className="mx-auto mb-2 opacity-40" />}
                    <p className="font-semibold text-foreground">No {threadType}s found</p>
                </div>
            )}
        </div>

        {isCreateOpen && (
            <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-surface border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl relative animate-in zoom-in-95">
                    <button type="button" onClick={() => setIsCreateOpen(false)} className="absolute top-4 right-4 text-muted hover:text-foreground cursor-pointer"><X size={20} /></button>
                    <h2 className="text-xl font-bold mb-6 text-foreground">New {isIssue ? 'Issue' : 'Discussion'}</h2>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40" placeholder="Title..." />
                        <textarea required rows={5} value={content} onChange={e => setContent(e.target.value)} className="w-full bg-background border border-border rounded-xl p-4 text-sm resize-none outline-none focus:ring-2 focus:ring-primary/40" placeholder="Details..." />
                        <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover flex justify-center gap-2 cursor-pointer">
                            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Publish'}
                        </button>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
}