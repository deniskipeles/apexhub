'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  MessageSquare, MessageCircle, Eye, Clock, 
  Search, Plus, Filter, Loader2, X 
} from 'lucide-react';
import { apex, getFileUrl } from '@/lib/apexkit';

interface Props {
  initialItems: any[];
}

export function DiscussionList({ initialItems }: Props) {
  const [items, setItems] = useState(initialItems);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("general");

  const filteredItems = items.filter(d => 
      d.data.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
          const res = await apex.collection('discussions').create({
              title,
              category,
              views: 0,
              replies: 0
          });
          // Add new item to top
          setItems([res, ...items]);
          setIsCreateOpen(false);
          setTitle("");
      } catch (err) {
          console.error(err);
      } finally {
          setIsSubmitting(false);
      }
  };

  const getAvatar = (record: any) => {
      const u = record.expand?.author_id;
      return u?.metadata?.avatar ? getFileUrl(u.metadata.avatar) : null;
  };
  const getUserName = (record: any) => record.expand?.author_id?.email?.split('@')[0] || 'User';

  return (
    <div>
        <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
            <div className="relative flex-1 sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                <input 
                    type="text" 
                    placeholder="Search discussions..." 
                    className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-lg text-sm text-foreground focus:ring-1 focus:ring-primary outline-none"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>
            <button 
                onClick={() => setIsCreateOpen(true)}
                className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-hover flex items-center gap-2 whitespace-nowrap shadow-sm transition-colors"
            >
                <Plus size={16} /> New Discussion
            </button>
        </div>

        <div className="grid gap-4">
            {filteredItems.map(d => (
                <Link key={d.id} href={`/community/discussions/${d.id}`}>
                    <div className="bg-surface border border-border rounded-xl p-5 hover:border-primary/40 transition-all flex flex-col md:flex-row gap-6 group hover:shadow-md">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded border ${
                                    d.data.category === 'qna' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                    d.data.category === 'showcase' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                                    'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
                                }`}>{d.data.category || 'General'}</span>
                                <span className="text-xs text-muted flex items-center gap-1">
                                    <Clock size={10} /> {new Date(d.created).toLocaleDateString()}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-3 group-hover:text-primary transition-colors">{d.data.title}</h3>
                            
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-secondary overflow-hidden flex items-center justify-center text-[10px] font-bold border border-border">
                                    {getAvatar(d) ? <img src={getAvatar(d)!} className="w-full h-full object-cover" alt="" /> : getUserName(d)[0]}
                                </div>
                                <span className="text-sm text-muted">by <span className="text-foreground font-medium">{getUserName(d)}</span></span>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 text-muted text-sm border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6 min-w-[140px]">
                            <div className="flex items-center gap-2"><MessageCircle size={18} /><span>{d.data.replies || 0}</span></div>
                            <div className="flex items-center gap-2"><Eye size={18} /><span>{d.data.views || 0}</span></div>
                        </div>
                    </div>
                </Link>
            ))}
            {filteredItems.length === 0 && <div className="text-center py-12 text-muted">No discussions found.</div>}
        </div>

        {isCreateOpen && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-surface border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl relative animate-in zoom-in-95">
                    <button onClick={() => setIsCreateOpen(false)} className="absolute top-4 right-4 text-muted hover:text-foreground"><X /></button>
                    <h2 className="text-xl font-bold mb-6">New Discussion</h2>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-muted mb-2">Title</label>
                            <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-background border border-border rounded-lg px-4 py-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted mb-2">Category</label>
                            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-background border border-border rounded-lg px-4 py-2">
                                <option value="general">General</option>
                                <option value="qna">Q & A</option>
                                <option value="showcase">Showcase</option>
                            </select>
                        </div>
                        <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover flex items-center justify-center gap-2">
                            {isSubmitting ? <Loader2 className="animate-spin" /> : 'Create Discussion'}
                        </button>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
}