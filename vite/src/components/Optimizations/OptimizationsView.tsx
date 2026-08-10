import React, { useState, useEffect } from 'react';
import { apex, getFileUrl } from '@/lib/apexkit';
import { useRouter, useSearchParams, usePathname } from '@/lib/navigation';
import { 
  Zap, Search, Plus, ThumbsUp, ThumbsDown, MessageSquare, 
  ArrowLeft, Send, Tag, Share2, Check,
  Loader2, X, User
} from 'lucide-react';
import { Pagination } from '../ui/Pagination';

export function OptimizationsView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedId = searchParams.get('id');
  const queryParam = searchParams.get('q') || '';
  const pageParam = Number(searchParams.get('page')) || 1;
  const tagParam = searchParams.get('tag') || null;

  const [optimizations, setOptimizations] = useState<any[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(queryParam);
  const [selectedStrategy, setSelectedStrategy] = useState<any | null>(null);

  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // 1. Load Optimization List or Detail
  useEffect(() => {
    setLoading(true);

    if (selectedId) {
      // Fetch Single Detail View
      Promise.all([
        apex.collection('optimizations').get(selectedId, { expand: 'author_id' }).catch(() => null),
        apex.collection('optimizations_conversations').list({
          filter: JSON.stringify({ optimization_id: Number(selectedId) || selectedId }),
          sort: 'created',
          expand: 'author_id',
          per_page: 100
        }).catch(() => ({ items: [] }))
      ]).then(([opt, commentsRes]) => {
        if (opt) {
          setSelectedStrategy({
            ...opt,
            comments: commentsRes.items || []
          });
        } else {
          setSelectedStrategy(null);
        }
      }).finally(() => setLoading(false));

    } else if (queryParam) {
      // Search via OSE (Instant Search)
      apex.collection('optimizations').searchRecordsInstantlyWithOSE(queryParam)
        .then((hits: any[]) => {
          const items = (hits || []).map((h: any) => ({
            id: h.id,
            data: {
              title: h.snippet?.title || h.title || 'Optimization Strategy',
              content: h.snippet?.content || h.content || '',
              tags: h.snippet?.tags || [],
              upvotes: h.snippet?.upvotes || 0,
              downvotes: h.snippet?.downvotes || 0
            },
            created: new Date().toISOString()
          }));
          setOptimizations(items);
          setTotalItems(items.length);
          setTotalPages(Math.ceil(items.length / 20));
        })
        .catch(() => { setOptimizations([]); setTotalItems(0); })
        .finally(() => setLoading(false));

    } else {
      // Load via get-optimizations-data Webhook or Direct Collection fallback
      apex.scripts.run(`get-optimizations-data?page=${pageParam}`, {__method__:"GET"})
        .then((res: any) => {
          if (res && res.success) {
            setTags(res.tags || []);
            let list = res.items || [];
            if (tagParam) {
              list = list.filter((i: any) => {
                const t = i.data?.tags;
                return Array.isArray(t) && t.includes(tagParam);
              });
            }
            setOptimizations(list);
            setTotalItems(res.total || list.length);
            setTotalPages(Math.ceil((res.total || list.length) / 20));
          } else {
            throw new Error("Fallback to direct list");
          }
        })
        .catch(() => {
          // Direct Collection Fallback
          apex.collection('optimizations').list({
            page: pageParam,
            per_page: 20,
            sort: '-created',
            expand: 'author_id'
          }).then((res: any) => {
            setOptimizations(res.items || []);
            setTotalItems(res.total || 0);
            setTotalPages(Math.ceil((res.total || 0) / 20));
          });
        })
        .finally(() => setLoading(false));
    }
  }, [selectedId, queryParam, pageParam, tagParam]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`${pathname}?q=${encodeURIComponent(search)}&page=1`);
  };

  const handleTagFilter = (tag: string | null) => {
    if (tag) {
      router.push(`${pathname}?tag=${encodeURIComponent(tag)}&page=1`);
    } else {
      router.push(`${pathname}?page=1`);
    }
  };

  const handleVote = async (optId: string | number, type: 'up' | 'down') => {
    try {
      const res = await apex.scripts.run('vote-optimization-strategy', {
        optimization_id: optId,
        type: type
      });

      if (res && res.success) {
        setOptimizations(prev => prev.map(item => {
          if (item.id === optId) {
            return {
              ...item,
              data: {
                ...item.data,
                upvotes: res.upvotes,
                downvotes: res.downvotes
              }
            };
          }
          return item;
        }));

        if (selectedStrategy && selectedStrategy.id === optId) {
          setSelectedStrategy({
            ...selectedStrategy,
            data: {
              ...selectedStrategy.data,
              upvotes: res.upvotes,
              downvotes: res.downvotes
            }
          });
        }
      }
    } catch (e: any) {
      alert(e.message || "Please sign in to vote.");
    }
  };

  const handleSubmitOptimization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    setIsSubmitting(true);
    try {
      const tagsArray = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(Boolean) : ['Performance'];
      
      await apex.scripts.run('create-optimization-strategy', {
        title,
        content,
        tags: tagsArray
      });

      setIsSubmitOpen(false);
      setTitle(''); setContent(''); setTagsInput('');
      router.push(`${pathname}?page=1`);
    } catch (err: any) {
      alert(err.message || "Failed to submit strategy. Make sure you are signed in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent, optId: string | number) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const newCommentRec = await apex.collection('optimizations_conversations').create({
        optimization_id: Number(optId) || optId,
        content: newComment
      });

      if (selectedStrategy) {
        setSelectedStrategy({
          ...selectedStrategy,
          comments: [...(selectedStrategy.comments || []), newCommentRec]
        });
      }
      setNewComment('');
    } catch (err: any) {
      alert(err.message || "Please sign in to comment.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <div className="text-center mb-10 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase mb-6 shadow-sm">
          <Zap size={14} className="text-amber-500" /> High-Performance Architecture
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
          Optimization Benchmarks & Tuning
        </h1>
        <p className="text-lg text-muted leading-relaxed">
          Community-driven architectural strategies, database tuning formulas, and memory optimizations for ApexKit instances.
        </p>
      </div>

      {/* DETAIL VIEW MODE */}
      {selectedId && selectedStrategy ? (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
          <button 
            type="button" 
            onClick={() => router.push(pathname)}
            className="inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-primary transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} /> Back to all optimizations
          </button>

          <div className="bg-surface border border-border rounded-3xl p-6 md:p-10 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-emerald-400 to-amber-400"></div>

            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex flex-wrap items-center gap-2">
                {(selectedStrategy.data?.tags || []).map((tag: string, i: number) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="text-xs text-muted font-medium">
                Published {new Date(selectedStrategy.created).toLocaleDateString()} by <span className="text-foreground font-bold">{selectedStrategy.expand?.author_id?.email?.split('@')[0] || 'Community Member'}</span>
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-6 leading-tight">
              {selectedStrategy.data?.title}
            </h2>

            <div className="prose prose-invert max-w-none text-sm md:text-base text-foreground/90 leading-relaxed mb-8 font-sans whitespace-pre-wrap">
              {selectedStrategy.data?.full_content || selectedStrategy.data?.content}
            </div>

            {/* Voting & Actions */}
            <div className="flex items-center justify-between border-t border-b border-border/80 py-4 my-8">
              <div className="flex items-center gap-3">
                <button 
                  type="button"
                  onClick={() => handleVote(selectedStrategy.id, 'up')}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  <ThumbsUp size={14} /> {selectedStrategy.data?.upvotes || 0} Upvotes
                </button>
                <button 
                  type="button"
                  onClick={() => handleVote(selectedStrategy.id, 'down')}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  <ThumbsDown size={14} /> {selectedStrategy.data?.downvotes || 0}
                </button>
              </div>

              <button 
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-foreground/5 hover:bg-foreground/10 border border-border text-foreground rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                {copiedLink ? <Check size={14} className="text-primary" /> : <Share2 size={14} />}
                <span>{copiedLink ? 'Copied Link' : 'Share Strategy'}</span>
              </button>
            </div>

            {/* Comments Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <MessageSquare size={18} className="text-primary" /> Community Comments ({(selectedStrategy.comments || []).length})
              </h3>

              <form onSubmit={(e) => handleAddComment(e, selectedStrategy.id)} className="space-y-3">
                <textarea 
                  rows={3} 
                  required
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Have you benchmarked this tuning parameter? Leave your feedback or query results..."
                  className="w-full bg-background border border-border rounded-xl p-4 text-sm text-foreground focus:ring-2 focus:ring-primary/40 outline-none resize-none"
                />
                <button 
                  type="submit" 
                  disabled={isSubmittingComment}
                  className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover flex items-center gap-2 text-xs shadow-md shadow-primary/20 transition-all cursor-pointer ml-auto"
                >
                  {isSubmittingComment ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                  <span>Post Comment</span>
                </button>
              </form>

              <div className="space-y-4 pt-4">
                {(selectedStrategy.comments || []).map((comment: any) => (
                  <div key={comment.id} className="p-4 bg-background border border-border/80 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted">
                      <span className="font-bold text-foreground flex items-center gap-1.5">
                        <User size={12} className="text-primary" /> {comment.expand?.author_id?.email?.split('@')[0] || 'Community Member'}
                      </span>
                      <span>{new Date(comment.created).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed">
                      {comment.data?.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* LIST VIEW MODE */
        <div className="space-y-8">
          {/* Controls Bar */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input 
                type="text" 
                placeholder="Search tuning strategies, WAL formulas, Tantivy indexes..." 
                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-foreground focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <button 
                type="button" 
                onClick={() => setIsSubmitOpen(true)} 
                className="w-full md:w-auto px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-hover flex items-center justify-center gap-2 shadow-md shadow-primary/20 transition-all cursor-pointer"
              >
                <Plus size={16} /> Submit Strategy
              </button>
            </div>
          </form>

          {/* Tags Pills */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-muted mr-2 flex items-center gap-1">
                <Tag size={12} /> Top 50 Tags:
              </span>
              <button 
                type="button"
                onClick={() => handleTagFilter(null)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  tagParam === null 
                    ? 'bg-primary text-white shadow-sm shadow-primary/20' 
                    : 'bg-surface border border-border text-muted hover:text-foreground'
                }`}
              >
                All
              </button>
              {tags.map((tag) => (
                <button 
                  key={tag}
                  type="button"
                  onClick={() => handleTagFilter(tag === tagParam ? null : tag)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    tagParam === tag 
                      ? 'bg-primary text-white shadow-sm shadow-primary/20' 
                      : 'bg-surface border border-border text-muted hover:text-foreground'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="flex justify-center p-20">
              <Loader2 className="animate-spin text-primary h-8 w-8" />
            </div>
          ) : optimizations.length === 0 ? (
            <div className="text-center py-20 bg-surface/30 border border-border rounded-2xl p-8">
              <Zap className="mx-auto text-muted mb-3 h-10 w-10 opacity-50" />
              <h3 className="text-lg font-bold text-foreground mb-1">No optimization strategies found</h3>
              <p className="text-sm text-muted mb-4">Be the first to publish a benchmark tuning formula to the database.</p>
              <button onClick={() => setIsSubmitOpen(true)} className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-md cursor-pointer">
                Submit Strategy
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {optimizations.map((item) => {
                const tagsList = Array.isArray(item.data?.tags) ? item.data.tags : [];

                return (
                  <div 
                    key={item.id} 
                    className="bg-surface border border-border rounded-2xl p-6 hover:border-primary/50 transition-all flex flex-col justify-between group hover:shadow-xl relative overflow-hidden"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex flex-wrap gap-1.5">
                          {tagsList.map((tag: string, idx: number) => (
                            <span key={idx} className="px-2.5 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">
                              #{tag}
                            </span>
                          ))}
                        </div>
                        <span className="text-[11px] text-muted font-mono">{new Date(item.created).toLocaleDateString()}</span>
                      </div>

                      <h3 
                        onClick={() => router.push(`${pathname}?id=${item.id}`)}
                        className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors leading-snug cursor-pointer"
                      >
                        {item.data?.title}
                      </h3>

                      <p className="text-sm text-muted line-clamp-3 leading-relaxed mb-6">
                        {item.data?.content}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-border/60 pt-4 mt-auto text-xs">
                      <div className="flex items-center gap-2">
                        <button 
                          type="button"
                          onClick={() => handleVote(item.id, 'up')}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-lg font-bold transition-colors cursor-pointer"
                        >
                          <ThumbsUp size={13} /> {item.data?.upvotes || 0}
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleVote(item.id, 'down')}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg font-bold transition-colors cursor-pointer"
                        >
                          <ThumbsDown size={13} /> {item.data?.downvotes || 0}
                        </button>
                      </div>

                      <button 
                        type="button"
                        onClick={() => router.push(`${pathname}?id=${item.id}`)}
                        className="flex items-center gap-1.5 text-primary hover:underline font-bold cursor-pointer"
                      >
                        <MessageSquare size={13} /> {item.expand?.comments_count || 0} Comments
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center pt-8 border-t border-border">
              <Pagination totalPages={totalPages} currentPage={pageParam} basePath={pathname} />
            </div>
          )}
        </div>
      )}

      {/* Submit Modal */}
      {isSubmitOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl p-8 max-w-lg w-full shadow-2xl relative animate-in zoom-in-95">
            <button type="button" onClick={() => setIsSubmitOpen(false)} className="absolute top-4 right-4 text-muted hover:text-foreground cursor-pointer"><X size={20} /></button>
            <h2 className="text-xl font-bold mb-6 text-foreground flex items-center gap-2">
              <Zap className="text-primary" size={20} /> Submit Optimization Strategy
            </h2>

            <form onSubmit={handleSubmitOptimization} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">Title</label>
                <input 
                  required 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/40 outline-none" 
                  placeholder="e.g. SQLite Page Cache Warmup Formula" 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">Tags (comma separated)</label>
                <input 
                  value={tagsInput} 
                  onChange={e => setTagsInput(e.target.value)} 
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/40 outline-none" 
                  placeholder="SQLite, Rust, Benchmarks, Memory" 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">Content & Code Snippets (Markdown)</label>
                <textarea 
                  required 
                  rows={6} 
                  value={content} 
                  onChange={e => setContent(e.target.value)} 
                  className="w-full bg-background border border-border rounded-xl p-4 text-sm resize-none focus:ring-2 focus:ring-primary/40 outline-none font-mono" 
                  placeholder="Detail PRAGMA configurations, memory allocation graphs, or code samples..." 
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all cursor-pointer"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Publish Strategy'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}