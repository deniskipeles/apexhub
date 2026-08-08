import React, { useState, useEffect } from 'react';
import { apex } from '@/lib/apexkit';
import { useRouter, useSearchParams } from '@/lib/navigation';
import { OptimizationStrategy, Comment } from '@/types';
import { 
  Zap, Search, Plus, ThumbsUp, ThumbsDown, MessageSquare, 
  Sparkles, ArrowLeft, Send, Tag, Share2, Check,
  Loader2, X, Terminal, Cpu, Database, Flame, ShieldCheck, User
} from 'lucide-react';

const DEFAULT_OPTIMIZATIONS: OptimizationStrategy[] = [
  {
    id: 'opt-sqlite-wal',
    title: 'SQLite WAL Mode & PRAGMA mmap_size Tuning',
    content: `When scaling SQLite to hundreds of concurrent read requests, default rollback journal modes cause file lock contention. By enabling Write-Ahead Logging (WAL) and memory-mapped file access, read operations bypass the write lock entirely.

### Recommended Configuration:
\`\`\`sql
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA mmap_size = 30000000000; -- 30 GB memory mapped I/O
PRAGMA page_size = 4096;
PRAGMA cache_size = -64000; -- 64 MB cache
\`\`\`

### Benchmark Impact:
- **Write Throughput**: +240% (1,200 req/sec -> 4,100 req/sec)
- **Read Latency**: Reduced from 8.2ms to 0.4ms
- **Lock Contention**: 0 lock errors under 500 active threads`,
    tags: ['SQLite', 'Database', 'WAL', 'Performance'],
    upvotes: 142,
    downvotes: 3,
    author: 'Dr. Apex',
    authorEmail: 'dr.apex@apexkit.dev',
    created: '2026-08-01',
    commentsCount: 2,
    comments: [
      {
        id: 'c1',
        author: 'DevNinja',
        authorEmail: 'ninja@dev.io',
        content: 'Setting synchronous to NORMAL in WAL mode is completely safe against corruption as long as the OS doesn’t crash during disk syncs.',
        created: '2026-08-02'
      },
      {
        id: 'c2',
        author: 'Rustacean',
        authorEmail: 'rust@kernel.org',
        content: 'We tested this in production with 10M rows and query time dropped by 90%!',
        created: '2026-08-03'
      }
    ]
  },
  {
    id: 'opt-tantivy-cache',
    title: 'Tantivy Inverted Index Caching for Sub-5ms Search',
    content: `Full-text search in Tantivy can experience latency spikes when reopening index segment readers on every transaction. By maintaining a thread-safe, lock-free LRU cache for immutable segments, term queries hit memory directly.

### Rust Implementation Snippet:
\`\`\`rust
use std::sync::Arc;
use tantivy::collector::TopDocs;
use tantivy::query::QueryParser;

pub struct SharedSearchEngine {
    reader: tantivy::IndexReader,
    query_cache: moka::sync::Cache<String, Vec<u32>>,
}

impl SharedSearchEngine {
    pub fn search(&self, text: &str) -> Vec<u32> {
        self.query_cache.get_or_insert(text.to_string(), || {
            let searcher = self.reader.searcher();
            // Perform inverted index lookup...
            vec![]
        })
    }
}
\`\`\`

### Benefits:
- **Sub-5ms response times** across 5,000,000 documents
- **Zero memory allocation** on repeated searches`,
    tags: ['Tantivy', 'Search', 'Rust', 'Memory'],
    upvotes: 98,
    downvotes: 1,
    author: 'RustaceanCore',
    authorEmail: 'core@rustacean.org',
    created: '2026-08-03',
    commentsCount: 1,
    comments: [
      {
        id: 'c3',
        author: 'SearchMaster',
        authorEmail: 'search@engine.dev',
        content: 'Moka cache integration is clean. Make sure to set eviction policy on high-cardinality queries.',
        created: '2026-08-04'
      }
    ]
  },
  {
    id: 'opt-boa-jit',
    title: 'Boa JS JIT Bytecode Cache Warmup',
    content: `Executing user-submitted Boa JavaScript hooks on every DB mutation introduces parse overhead. By pre-parsing JavaScript files into binary AST bytecode and caching the compilation context in memory, hook execution speed is quadrupled.

### Flow:
1. Hook uploaded -> Parse JS -> Serialize Bytecode to RAM.
2. Mutation triggered -> Deserialize bytecode into pre-allocated VM frame.
3. Execution time drops from 12ms to 0.8ms per hook call.`,
    tags: ['Boa JS', 'Engine', 'JIT', 'Scripts'],
    upvotes: 87,
    downvotes: 2,
    author: 'ScriptMaster',
    authorEmail: 'script@boa.js',
    created: '2026-08-04',
    commentsCount: 0,
    comments: []
  },
  {
    id: 'opt-vector-quant',
    title: 'Vector IVF-PQ Product Quantization for Embeddings',
    content: `Storing 1536-dimensional floating point embeddings in memory for vector search consumes ~6KB per vector. Using Product Quantization (PQ-16), vectors are compressed down to 64 bytes with 97.4% recall accuracy.

### Storage Efficiency:
- **Uncompressed**: 100,000 vectors = 614 MB RAM
- **Quantized (IVF-PQ)**: 100,000 vectors = 6.4 MB RAM (96x reduction!)`,
    tags: ['Vector', 'AI', 'Quantization', 'Memory'],
    upvotes: 115,
    downvotes: 4,
    author: 'AI-Studio',
    authorEmail: 'ai@studio.google.com',
    created: '2026-08-05',
    commentsCount: 1,
    comments: [
      {
        id: 'c4',
        author: 'DataSci',
        authorEmail: 'data@science.org',
        content: 'IVF-PQ is essential for running local RAG on constrained edge servers.',
        created: '2026-08-06'
      }
    ]
  }
];

export function OptimizationsView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get('id');

  const [optimizations, setOptimizations] = useState<OptimizationStrategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    setLoading(true);
    apex.collection('optimizations').list({ sort: '-created' })
      .then((res: any) => {
        const fetched = res.items || [];
        if (fetched.length === 0) {
          setOptimizations(DEFAULT_OPTIMIZATIONS);
        } else {
          const combined = [...fetched];
          DEFAULT_OPTIMIZATIONS.forEach(d => {
            if (!combined.some(i => i.id === d.id)) combined.push(d);
          });
          setOptimizations(combined);
        }
      })
      .catch(() => setOptimizations(DEFAULT_OPTIMIZATIONS))
      .finally(() => setLoading(false));
  }, []);

  const handleVote = (id: string, type: 'up' | 'down') => {
    setOptimizations(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          upvotes: type === 'up' ? item.upvotes + 1 : item.upvotes,
          downvotes: type === 'down' ? item.downvotes + 1 : item.downvotes
        };
      }
      return item;
    }));
  };

  const handleSubmitOptimization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    setIsSubmitting(true);
    const newOpt: OptimizationStrategy = {
      id: `opt-${Date.now()}`,
      title,
      content,
      tags: tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(Boolean) : ['Performance'],
      upvotes: 1,
      downvotes: 0,
      author: 'Developer',
      authorEmail: 'dev@apexkit.io',
      created: new Date().toISOString().split('T')[0],
      commentsCount: 0,
      comments: []
    };

    try {
      await apex.collection('optimizations').create(newOpt);
    } catch {
      // Local addition fallback
    }

    setOptimizations([newOpt, ...optimizations]);
    setIsSubmitting(false);
    setIsSubmitOpen(false);
    setTitle(''); setContent(''); setTagsInput('');
  };

  const handleAddComment = (e: React.FormEvent, optId: string) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    const commentObj: Comment = {
      id: `c-${Date.now()}`,
      author: 'Apex Developer',
      authorEmail: 'dev@apexkit.io',
      content: newComment,
      created: new Date().toISOString().split('T')[0]
    };

    setOptimizations(prev => prev.map(item => {
      if (item.id === optId) {
        return {
          ...item,
          commentsCount: item.commentsCount + 1,
          comments: [...item.comments, commentObj]
        };
      }
      return item;
    }));

    setNewComment('');
    setIsSubmittingComment(false);
  };

  const allTags = Array.from(new Set(optimizations.flatMap(o => o.tags)));

  const filteredOptimizations = optimizations.filter(item => {
    const matchesSearch = !search || 
      item.title.toLowerCase().includes(search.toLowerCase()) || 
      item.content.toLowerCase().includes(search.toLowerCase()) ||
      item.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));

    const matchesTag = !selectedTag || item.tags.includes(selectedTag);

    return matchesSearch && matchesTag;
  });

  const activeStrategy = selectedId ? optimizations.find(o => o.id === selectedId) : null;

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
      {activeStrategy ? (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
          <button 
            type="button" 
            onClick={() => router.push('/optimizations')}
            className="inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-primary transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} /> Back to all optimizations
          </button>

          <div className="bg-surface border border-border rounded-3xl p-6 md:p-10 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-emerald-400 to-amber-400"></div>

            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex flex-wrap items-center gap-2">
                {activeStrategy.tags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="text-xs text-muted font-medium">
                Published {activeStrategy.created} by <span className="text-foreground font-bold">{activeStrategy.author}</span>
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-6 leading-tight">
              {activeStrategy.title}
            </h2>

            <div className="prose prose-invert max-w-none text-sm md:text-base text-foreground/90 leading-relaxed mb-8 whitespace-pre-line font-sans">
              {activeStrategy.content}
            </div>

            {/* Voting & Actions */}
            <div className="flex items-center justify-between border-t border-b border-border/80 py-4 my-8">
              <div className="flex items-center gap-3">
                <button 
                  type="button"
                  onClick={() => handleVote(activeStrategy.id, 'up')}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  <ThumbsUp size={14} /> {activeStrategy.upvotes} Upvotes
                </button>
                <button 
                  type="button"
                  onClick={() => handleVote(activeStrategy.id, 'down')}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  <ThumbsDown size={14} /> {activeStrategy.downvotes}
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
                <MessageSquare size={18} className="text-primary" /> Community Comments ({activeStrategy.comments.length})
              </h3>

              <form onSubmit={(e) => handleAddComment(e, activeStrategy.id)} className="space-y-3">
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
                {activeStrategy.comments.map((comment) => (
                  <div key={comment.id} className="p-4 bg-background border border-border/80 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted">
                      <span className="font-bold text-foreground flex items-center gap-1.5">
                        <User size={12} className="text-primary" /> {comment.author}
                      </span>
                      <span>{comment.created}</span>
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed">
                      {comment.content}
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
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
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
          </div>

          {/* Tags Pills */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-muted mr-2 flex items-center gap-1">
              <Tag size={12} /> Filter Tag:
            </span>
            <button 
              type="button"
              onClick={() => setSelectedTag(null)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedTag === null 
                  ? 'bg-primary text-white shadow-sm shadow-primary/20' 
                  : 'bg-surface border border-border text-muted hover:text-foreground'
              }`}
            >
              All Strategies
            </button>
            {allTags.map((tag) => (
              <button 
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedTag === tag 
                    ? 'bg-primary text-white shadow-sm shadow-primary/20' 
                    : 'bg-surface border border-border text-muted hover:text-foreground'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="flex justify-center p-20">
              <Loader2 className="animate-spin text-primary h-8 w-8" />
            </div>
          ) : filteredOptimizations.length === 0 ? (
            <div className="text-center py-20 bg-surface/30 border border-border rounded-2xl p-8">
              <Zap className="mx-auto text-muted mb-3 h-10 w-10 opacity-50" />
              <h3 className="text-lg font-bold text-foreground mb-1">No optimization strategies match</h3>
              <p className="text-sm text-muted mb-4">Try clearing your filters or submit a new benchmark formula.</p>
              <button onClick={() => { setSearch(''); setSelectedTag(null); }} className="text-xs text-primary font-bold hover:underline">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredOptimizations.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-surface border border-border rounded-2xl p-6 hover:border-primary/50 transition-all flex flex-col justify-between group hover:shadow-xl relative overflow-hidden"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex flex-wrap gap-1.5">
                        {item.tags.map((tag, idx) => (
                          <span key={idx} className="px-2.5 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <span className="text-[11px] text-muted font-mono">{item.created}</span>
                    </div>

                    <h3 
                      onClick={() => router.push(`/optimizations/${item.id}`)}
                      className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors leading-snug cursor-pointer"
                    >
                      {item.title}
                    </h3>

                    <p className="text-sm text-muted line-clamp-3 leading-relaxed mb-6">
                      {item.content.replace(/```[a-z]*\n[\s\S]*?\n```/g, '[Code Snippet]')}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-border/60 pt-4 mt-auto text-xs">
                    <div className="flex items-center gap-2">
                      <button 
                        type="button"
                        onClick={() => handleVote(item.id, 'up')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-lg font-bold transition-colors cursor-pointer"
                      >
                        <ThumbsUp size={13} /> {item.upvotes}
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleVote(item.id, 'down')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg font-bold transition-colors cursor-pointer"
                      >
                        <ThumbsDown size={13} /> {item.downvotes}
                      </button>
                    </div>

                    <button 
                      type="button"
                      onClick={() => router.push(`/optimizations/${item.id}`)}
                      className="flex items-center gap-1.5 text-primary hover:underline font-bold cursor-pointer"
                    >
                      <MessageSquare size={13} /> {item.commentsCount} Comments
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Submit Modal */}
      {isSubmitOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl p-8 max-w-lg w-full shadow-2xl relative animate-in zoom-in-95">
            <button type="button" onClick={() => setIsSubmitOpen(false)} className="absolute top-4 right-4 text-muted hover:text-foreground"><X size={20} /></button>
            <h2 className="text-xl font-bold mb-6 text-foreground flex items-center gap-2">
              <Zap className="text-primary" size={20} /> Submit Optimization Formula
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
