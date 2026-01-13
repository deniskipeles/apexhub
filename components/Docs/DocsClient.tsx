'use client';

import React, { useState, useEffect } from 'react';
import { apex } from '@/lib/apexkit';
import { renderMarkdown } from '@/lib/commonHelpers';
import { 
  Search, Loader2, FileText, ChevronRight, Book, Code, Edit3, 
  Plus, Menu, X, Check, Share2, Layers, Cpu, ChevronLeft 
} from 'lucide-react';
import Link from 'next/link';

// Types
interface DocRecord {
  id: string;
  data: {
    title: string;
    content: string;
    category: string;
  };
  created: string;
}

const getCategoryIcon = (id: string) => {
    const lower = id.toLowerCase();
    if (lower.includes('start')) return Book;
    if (lower.includes('api')) return Code;
    if (lower.includes('core')) return Cpu;
    if (lower.includes('deploy')) return Layers;
    return FileText;
};

export function DocsClient({ initialDocs, categories }: { initialDocs: any[], categories: string[] }) {
  // Data State
  const [docs, setDocs] = useState<DocRecord[]>(initialDocs);
  const [activeArticle, setActiveArticle] = useState<DocRecord | null>(initialDocs[0] || null);
  const [renderedContent, setRenderedContent] = useState('');
  
  // UI State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Items per category group? Or total? Docs usually list all in sidebar. 
  // Let's assume pagination applies if a category has TOO MANY items, but usually docs sidebars scroll.
  // Implementing pagination for the ARTICLE LIST (Sidebar) if needed.
  
  // Contribution Form State
  const [isContributeOpen, setIsContributeOpen] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formCategory, setFormCategory] = useState(categories[0] || "general");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Group Docs
  const groups = docs.reduce((acc, doc) => {
      const cat = doc.data.category || 'general';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(doc);
      return acc;
  }, {} as Record<string, DocRecord[]>);

  // Markdown Effect
  useEffect(() => {
      const render = async () => {
          if (activeArticle?.data.content) {
              const html = await renderMarkdown(activeArticle.data.content);
              setRenderedContent(html);
          }
      };
      render();
  }, [activeArticle]);

  // Search Handler
  const handleSearch = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!query.trim()) { setSearchResults([]); return; }
      setIsSearching(true);
      try {
          const res = await apex.collection('docs').searchTextVector(query, 5);
          setSearchResults(res);
      } finally {
          setIsSearching(false);
      }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
          const res = await apex.collection('docs').create({
              title: formTitle,
              content: formContent,
              category: formCategory
          });
          
          // Optimistic Update
          const newDoc = {
              id: res.id,
              data: { title: formTitle, content: formContent, category: formCategory },
              created: new Date().toISOString()
          };
          setDocs(prev => [...prev, newDoc]);
          
          setIsContributeOpen(false);
          setFormTitle("");
          setFormContent("");
      } catch(e) {
          alert("Failed to submit guide");
      } finally {
          setIsSubmitting(false);
      }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen relative">
        
        {/* Mobile Header */}
        <div className="md:hidden p-4 border-b border-border bg-surface flex justify-between items-center sticky top-16 z-30">
            <span className="font-bold">Documentation</span>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X /> : <Menu />}
            </button>
        </div>

        {/* Sidebar */}
        <aside className={`
            fixed inset-0 z-20 md:static md:z-0 w-full md:w-72 bg-surface/30 border-r border-border p-6 flex-shrink-0 backdrop-blur-xl md:backdrop-blur-none transition-transform duration-300 md:h-auto
            ${mobileMenuOpen ? 'translate-x-0 bg-background pt-24' : '-translate-x-full md:translate-x-0'}
        `}>
            <button 
                onClick={() => { setIsContributeOpen(true); setMobileMenuOpen(false); }}
                className="w-full mb-6 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg flex items-center justify-center gap-2 font-medium"
            >
                <Plus size={16} /> Contribute
            </button>

            <nav className="space-y-8 pb-20 md:pb-0 h-full overflow-y-auto">
                {Object.entries(groups).map(([cat, items]) => {
                    const Icon = getCategoryIcon(cat);
                    return (
                        <div key={cat}>
                            <h3 className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-wider mb-2 px-2">
                                <Icon size={14} /> {cat.replace(/-/g, ' ')}
                            </h3>
                            <ul className="border-l border-border ml-2 pl-2 space-y-1">
                                {items.map(doc => (
                                    <li key={doc.id}>
                                        <button
                                            onClick={() => {
                                                setActiveArticle(doc);
                                                setMobileMenuOpen(false);
                                                setSearchResults([]);
                                                setQuery("");
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors truncate ${
                                                activeArticle?.id === doc.id ? 'text-primary bg-primary/5 font-medium' : 'text-muted hover:text-foreground'
                                            }`}
                                        >
                                            {doc.data.title}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
             {/* Search */}
             <div className="sticky top-16 md:top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border p-4 md:p-6">
                <form onSubmit={handleSearch} className="relative max-w-3xl mx-auto">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                    <input 
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search docs..."
                        className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-foreground focus:ring-1 focus:ring-primary outline-none"
                    />
                    {isSearching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-primary" size={16} />}
                </form>
             </div>

             <div className="p-6 md:p-12 max-w-4xl mx-auto">
                {/* Search Results */}
                {searchResults.length > 0 && (
                    <div className="mb-12 space-y-4">
                        <h2 className="text-sm font-bold text-muted uppercase">Results</h2>
                        {searchResults.map((res: any) => (
                             <div key={res.id} className="bg-surface/50 border border-border rounded-lg p-4 cursor-pointer hover:border-primary/50" onClick={() => {
                                 // Logic to find doc by ID and set active
                                 const doc = docs.find(d => d.id === res.id); // Assuming ID matches
                                 if(doc) { setActiveArticle(doc); setSearchResults([]); setQuery(""); }
                             }}>
                                 <div className="text-sm font-medium text-foreground mb-1">Result match</div>
                                 <div className="text-xs text-muted line-clamp-2">{res.content}</div>
                             </div>
                        ))}
                    </div>
                )}

                {/* Article */}
                {activeArticle ? (
                    <article className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="mb-8 border-b border-border pb-6">
                            <div className="flex items-center gap-2 text-sm text-muted mb-2">
                                <span className="capitalize">{activeArticle.data.category}</span>
                                <ChevronRight size={14} />
                            </div>
                            <h1 className="text-4xl font-bold text-foreground">{activeArticle.data.title}</h1>
                        </div>
                        <div 
                            className="prose prose-zinc dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: renderedContent }}
                        />
                    </article>
                ) : (
                    <div className="text-center py-20 text-muted">Select a guide to read.</div>
                )}
             </div>
        </div>

        {/* Modal */}
        {isContributeOpen && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-2xl shadow-2xl relative animate-in zoom-in-95">
                    <button onClick={() => setIsContributeOpen(false)} className="absolute top-4 right-4 text-muted hover:text-foreground"><X /></button>
                    <h2 className="text-xl font-bold mb-6">Contribute Guide</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-muted mb-1">Title</label>
                                <input required value={formTitle} onChange={e => setFormTitle(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm text-muted mb-1">Category</label>
                                <select value={formCategory} onChange={e => setFormCategory(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2">
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-muted mb-1">Content (Markdown)</label>
                            <textarea required rows={10} value={formContent} onChange={e => setFormContent(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 font-mono text-sm" />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setIsContributeOpen(false)} className="px-4 py-2 rounded-lg hover:bg-white/5">Cancel</button>
                            <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-hover disabled:opacity-50">
                                {isSubmitting ? <Loader2 className="animate-spin" /> : 'Submit'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
}