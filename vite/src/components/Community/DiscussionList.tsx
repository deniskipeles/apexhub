import React, { useState } from 'react';
import { 
  MessageCircle, Clock, 
  Search, Plus, Loader2, X 
} from 'lucide-react';
import { apex, getFileUrl } from '@/lib/apexkit';
import { Link } from '@/lib/navigation';

interface Props {
  initialItems: any[];
}

export function DiscussionList({ initialItems }: Props) {
  const [items, setItems] = useState(initialItems);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");

  const filteredItems = items.filter(d => 
      d.data?.topic?.toLowerCase().includes(search.toLowerCase()) ||
      d.data?.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
          const res = await apex.collection('discussions').create({
              topic,
              description
          });
          setItems([res, ...items]);
          setIsCreateOpen(false);
          setTopic("");
          setDescription("");
      } catch (err: any) {
          console.error(err);
          alert(err.message || "Failed to create discussion. Make sure you are signed in.");
      } finally {
          setIsSubmitting(false);
      }
  };

  const getAvatar = (record: any) => {
      const u = record.expand?.posted_by_id || record.expand?.author_id;
      return u?.metadata?.avatar ? getFileUrl(u.metadata.avatar) : null;
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
                    placeholder="Search discussions..." 
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
                <Plus size={16} /> New Discussion
            </button>
        </div>

        <div className="grid gap-4">
            {filteredItems.map(d => (
                <Link key={d.id} href={`/ecosystem/discussions/${d.id}`}>
                    <div className="bg-surface border border-border rounded-2xl p-6 hover:border-primary/40 transition-all flex flex-col md:flex-row gap-6 group hover:shadow-lg">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs text-muted flex items-center gap-1 font-mono">
                                    <Clock size={12} /> {new Date(d.created).toLocaleDateString()}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors leading-snug">
                                {d.data?.topic}
                            </h3>
                            <p className="text-sm text-muted line-clamp-2 leading-relaxed mb-4">
                                {d.data?.description}
                            </p>
                            
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center text-[10px] font-bold border border-primary/20 text-primary">
                                    {getAvatar(d) ? <img src={getAvatar(d)!} className="w-full h-full object-cover" alt="" /> : getUserName(d)[0]?.toUpperCase()}
                                </div>
                                <span className="text-xs text-muted">Posted by <span className="text-foreground font-semibold">{getUserName(d)}</span></span>
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
            {filteredItems.length === 0 && (
                <div className="text-center py-16 text-muted border border-dashed border-border rounded-2xl bg-surface/30">
                    <MessageCircle size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-foreground">No discussions in database</p>
                    <p className="text-xs text-muted mt-1">Start a conversation with the community.</p>
                </div>
            )}
        </div>

        {isCreateOpen && (
            <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-surface border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl relative animate-in zoom-in-95">
                    <button type="button" onClick={() => setIsCreateOpen(false)} className="absolute top-4 right-4 text-muted hover:text-foreground cursor-pointer"><X size={20} /></button>
                    <h2 className="text-xl font-bold mb-6 text-foreground">New Discussion Topic</h2>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">Topic Title</label>
                            <input required value={topic} onChange={e => setTopic(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40" placeholder="e.g. Optimal SQLite WAL configuration" />
                        </div>
                        <div>
                             <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">Description</label>
                             <textarea required rows={5} value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-background border border-border rounded-xl p-4 text-sm resize-none outline-none focus:ring-2 focus:ring-primary/40" placeholder="Provide context, questions, or ideas..." />
                        </div>
                        <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all cursor-pointer">
                            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Publish Topic'}
                        </button>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
}