import React, { useEffect, useState } from 'react';
import { apex } from '@/lib/apexkit';
import { SearchBar } from './SearchBar';
import { DocsSidebar } from './DocsSidebar';
import { getCategoryIcon } from '@/lib/icons';
import { MarkdownRenderer } from '../MarkdowRenderer';
import { MarkdownEditor } from '../MarkdownEditor';
import { Pagination } from '../ui/Pagination';
import { Link, useRouter, useSearchParams } from '@/lib/navigation';
import { useApexStore } from '@/store/useApexStore';
import { 
    Plus, BookOpen, ChevronRight, FileText, Share2, Calendar, Sparkles, ArrowRight, Loader2, ArrowLeft, CheckCircle2 
} from 'lucide-react';

async function getRelatedDocs(id: string) {
    try {
        const vectors = await apex.collection('docs').getVector(id);
        if (!vectors || vectors.length === 0) return [];
        const target = vectors[0];
        const results = await apex.collection('docs').searchVectorWithVector(
            target.field_name, 
            target.vector, 
            { per_page: 5 }
        );
        return results
            .items.filter((r: any) => r.id.toString() !== id.toString())
            .slice(0, 3);
    } catch {
        return [];
    }
}

export function DocsView() {
    const { currentRoute, routeParams } = useApexStore();
    const searchParams = useSearchParams();
    const router = useRouter();

    const query = searchParams.get('q') || '';
    const page = Number(searchParams.get('page')) || 1;
    const type = (searchParams.get('type') as 'instant' | 'vector') || 'instant';

    const [loading, setLoading] = useState(true);
    const [groups, setGroups] = useState<Record<string, any[]>>({});
    const [searchResults, setSearchResults] = useState<{ items: any[]; total: number }>({ items: [], total: 0 });
    const [singleDoc, setSingleDoc] = useState<any>(null);
    const [relatedDocs, setRelatedDocs] = useState<any[]>([]);

    // State for New Doc Form
    const [newTitle, setNewTitle] = useState("");
    const [newContent, setNewContent] = useState("");
    const [newCategory, setNewCategory] = useState("general");
    const [categories, setCategories] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState("");

    // Load data based on route/query
    useEffect(() => {
        setLoading(true);

        if (currentRoute === 'doc-new') {
            apex.admins.getCollection('docs').then((docCol: any) => {
                let options: string[] = [];
                if (docCol?.schema?.fields?.['category']?.options) {
                    options = docCol.schema.fields['category'].options;
                } else if (Array.isArray(docCol?.schema)) {
                    const f = docCol.schema.find((f: any) => f.name === 'category');
                    if (f?.options) options = f.options;
                }
                setCategories(options);
                if (options.length > 0) setNewCategory(options[0]);
            }).catch(console.error).finally(() => setLoading(false));
            return;
        }

        if (currentRoute === 'doc-detail') {
            const id = routeParams.id;
            Promise.all([
                apex.collection('docs').list({ sort: 'title', per_page: 200 }).catch(() => ({ items: [] })),
                apex.collection('docs').get(id, { expand: 'added_by' }).catch(() => null)
            ]).then(async ([listRes, docRes]) => {
                if (docRes) {
                    setSingleDoc(docRes);
                    const related = await getRelatedDocs(id);
                    setRelatedDocs(related);
                } else {
                    setSingleDoc(null);
                }

                const grps: Record<string, any[]> = {};
                (listRes.items || []).forEach((d: any) => {
                    const cat = d.data?.category || 'general';
                    if (!grps[cat]) grps[cat] = [];
                    grps[cat].push(d);
                });
                setGroups(grps);
            }).finally(() => setLoading(false));
            return;
        }

        // Search mode or Directory mode
        if (query) {
            if (type === 'instant') {
                apex.collection('docs').searchRecordsInstantlyWithOSE(query)
                    .then((res: any[]) => {
                        const start = (page - 1) * 20;
                        const end = start + 20;
                        setSearchResults({
                            items: (res || []).slice(start, end).map((r: any) => ({
                                id: r.id,
                                data: { title: r.snippet?.title || r.title || 'Untitled', content: r.snippet?.content || r.content || '', category: 'search-result' }
                            })),
                            total: (res || []).length
                        });
                    })
                    .catch(() => setSearchResults({ items: [], total: 0 }))
                    .finally(() => setLoading(false));
            } else {
                apex.collection('docs').searchVectorWithText(query, { per_page: 20 })
                    .then((res: any) => {
                        setSearchResults({
                            items: (res.items || []).map((r: any) => ({
                                id: r.id,
                                data: r.data,
                                _score: r._score
                            })),
                            total: (res.items || []).length
                        });
                    })
                    .catch(() => setSearchResults({ items: [], total: 0 }))
                    .finally(() => setLoading(false));
            }
        } else {
            apex.collection('docs').list({ sort: 'title', per_page: 200 })
                .then((res: any) => {
                    const grps: Record<string, any[]> = {};
                    (res.items || []).forEach((d: any) => {
                        const cat = d.data?.category || 'general';
                        if (!grps[cat]) grps[cat] = [];
                        grps[cat].push(d);
                    });
                    setGroups(grps);
                })
                .catch(() => setGroups({}))
                .finally(() => setLoading(false));
        }
    }, [currentRoute, routeParams.id, query, page, type]);

    const handleCreateDoc = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle || !newContent || !newCategory) return;
        setIsSubmitting(true);
        setFormError("");

        try {
            const res = await apex.collection('docs').create({
                title: newTitle,
                content: newContent,
                category: newCategory,
            });
            router.push(`/docs/${res.id}`);
        } catch (err: any) {
            console.error(err);
            setFormError(err.message || "Failed to create guide. Please try again.");
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-[50vh]"><Loader2 className="animate-spin text-muted h-8 w-8" /></div>;
    }

    // New Guide Form View
    if (currentRoute === 'doc-new') {
        return (
            <div className="min-h-screen p-6 md:p-12 max-w-3xl mx-auto">
                <div className="mb-8">
                    <Link href="/docs" className="text-sm text-muted hover:text-primary flex items-center gap-1 mb-4 w-fit transition-colors">
                        <ArrowLeft size={14} /> Back to Docs
                    </Link>
                    <h1 className="text-3xl font-bold text-foreground">Contribute a Guide</h1>
                    <p className="text-muted mt-1">Share your knowledge with the community.</p>
                </div>

                <form onSubmit={handleCreateDoc} className="space-y-6 bg-surface/30 border border-border p-6 md:p-8 rounded-2xl shadow-sm">
                    {formError && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">
                            {formError}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Guide Title</label>
                            <input 
                                type="text" 
                                required
                                value={newTitle}
                                onChange={e => setNewTitle(e.target.value)}
                                placeholder="e.g. Deploying on Vercel"
                                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition-all placeholder:text-muted/50"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Category</label>
                            <div className="relative">
                                <select 
                                    value={newCategory}
                                    onChange={e => setNewCategory(e.target.value)}
                                    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary focus:outline-none appearance-none"
                                >
                                    {categories.length > 0 ? (
                                        categories.map(c => (
                                            <option key={c} value={c}>{c.replace(/-/g, ' ')}</option>
                                        ))
                                    ) : (
                                        <option value="general">General</option>
                                    )}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Content (Markdown)</label>
                        <MarkdownEditor
                            initialValue={newContent}
                            onChange={(md) => setNewContent(md)}
                        />
                        <p className="text-xs text-muted text-right">Supports GitHub Flavored Markdown</p>
                    </div>

                    <div className="pt-4 border-t border-border flex justify-end gap-3">
                        <Link href="/docs" className="px-6 py-2.5 rounded-lg border border-border text-foreground hover:bg-surface font-medium transition-colors">
                            Cancel
                        </Link>
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="px-8 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <><CheckCircle2 size={18} /> Publish Guide</>}
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    // Single Document View
    if (currentRoute === 'doc-detail') {
        if (!singleDoc) return <div className="p-12 text-center text-muted">Doc Not Found</div>;
        const authorName = singleDoc.expand?.added_by?.email?.split('@')[0] || 'ApexTeam';

        return (
            <div className="flex flex-col md:flex-row min-h-screen">
                <div className="hidden md:block sticky top-0 h-screen overflow-y-auto">
                    <DocsSidebar groups={groups} />
                </div>

                <article className="flex-1 min-w-0 p-6 md:p-12 md:max-w-4xl mx-auto">
                    <div className="mb-8 flex items-center gap-2 text-sm text-muted">
                        <Link href="/docs" className="hover:text-foreground transition-colors">Docs</Link>
                        <span>/</span>
                        <span className="capitalize">{singleDoc.data?.category}</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground tracking-tight">{singleDoc.data?.title}</h1>
                    
                    <div className="flex items-center gap-4 text-sm text-muted mb-12 pb-8 border-b border-border">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center text-[10px] font-bold">
                                {authorName[0]?.toUpperCase()}
                            </div>
                            <span>{authorName}</span>
                        </div>
                        <span>•</span>
                        <span className="flex items-center gap-1.5">
                            <Calendar size={14} /> {new Date(singleDoc.created).toLocaleDateString()}
                        </span>
                    </div>

                    <MarkdownRenderer content={singleDoc.data?.content || ''} />
                    
                    {relatedDocs.length > 0 && (
                        <div className="mt-16 pt-10 border-t border-border">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-foreground">
                                <Sparkles className="h-4 w-4 text-primary" /> Related Guides
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {relatedDocs.map((item: any) => (
                                    <Link 
                                        key={item.id} 
                                        href={`/docs/${item.id}`}
                                        className="group p-4 rounded-xl border border-border bg-surface/30 hover:bg-surface hover:border-primary/30 transition-all flex flex-col h-full"
                                    >
                                        <span className="text-xs font-bold text-muted uppercase tracking-wider mb-2">
                                            {item.data?.category || 'Guide'}
                                        </span>
                                        <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">
                                            {item.data?.title}
                                        </h4>
                                        <div className="mt-auto flex items-center text-xs text-muted font-medium pt-2">
                                            Read more <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-8 pt-8 flex justify-end">
                        <button type="button" className="flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors">
                            <Share2 size={16} /> Share this guide
                        </button>
                    </div>
                </article>
            </div>
        );
    }

    // Main Directory & Search View
    const isSearchMode = query.length > 0;
    const sortedCategories = Object.keys(groups).sort();

    return (
        <div className="min-h-screen p-6 md:p-12 max-w-[1400px] mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-muted text-xs font-semibold tracking-wide uppercase mb-6">
                    <BookOpen size={12} /> Knowledge Base
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight">Documentation</h1>
                
                <div className="max-w-2xl mx-auto mb-10">
                    <SearchBar initialQuery={query} initialType={type} />
                </div>

                <Link 
                    href="/docs/new" 
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-surface border border-border hover:border-primary/50 hover:bg-surface/80 text-sm font-medium text-foreground transition-all group"
                >
                    <Plus size={16} className="text-primary group-hover:scale-110 transition-transform" /> Contribute a new guide
                </Link>
            </div>

            {isSearchMode ? (
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-lg font-semibold mb-6 text-muted">
                        Found {searchResults.total} results for <span className="text-foreground">"{query}"</span>
                    </h2>
                    
                    <div className="space-y-4">
                        {searchResults.items.map((doc: any) => (
                            <Link key={doc.id} href={`/docs/${doc.id}`} className="block group">
                                <div className="bg-surface/30 border border-border rounded-xl p-6 hover:bg-surface/50 hover:border-primary/30 transition-all">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                                            {doc.data?.title}
                                        </h3>
                                        <ChevronRight className="text-muted opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" size={18} />
                                    </div>
                                    <p className="text-muted text-sm line-clamp-2 leading-relaxed">
                                        {String(doc.data?.content || '').replace(/<[^>]*>?/gm, '')}
                                    </p>
                                    <div className="flex items-center gap-2 mt-4 text-xs text-muted/60 font-mono">
                                        <span>ID: {doc.id}</span>
                                        {doc._score && <span>• Score: {(doc._score * 10).toFixed(1)}</span>}
                                    </div>
                                </div>
                            </Link>
                        ))}
                        {searchResults.items.length === 0 && (
                            <div className="text-center py-20 text-muted italic border border-dashed border-border rounded-xl">
                                No results found. Try a different query.
                            </div>
                        )}
                    </div>

                    {searchResults.total > 20 && (
                        <div className="mt-12 flex justify-center">
                            <Pagination totalPages={Math.ceil(searchResults.total / 20)} currentPage={page} basePath={`/docs?q=${query}&type=${type}`} />
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedCategories.map(category => {
                        const Icon = getCategoryIcon(category);
                        const items = groups[category];
                        const displayItems = items.slice(0, 5); 
                        const hasMore = items.length > 5;

                        return (
                            <div key={category} className="bg-surface/30 border border-border rounded-2xl p-6 hover:bg-surface/50 hover:border-primary/20 transition-all group flex flex-col h-full shadow-sm hover:shadow-md relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-primary/10 transition-colors"></div>

                                <div className="flex items-center gap-3 mb-6 relative z-10">
                                    <div className="p-2.5 bg-background rounded-xl border border-border text-muted group-hover:text-primary group-hover:border-primary/30 transition-all shadow-sm">
                                        <Icon size={22} />
                                    </div>
                                    <h2 className="text-xl font-bold text-foreground capitalize tracking-tight">
                                        {category.replace(/-/g, ' ')}
                                    </h2>
                                </div>
                                
                                <ul className="space-y-1 mb-6 flex-1 relative z-10">
                                    {displayItems.map((doc: any) => (
                                        <li key={doc.id}>
                                            <Link 
                                                href={`/docs/${doc.id}`}
                                                className="flex items-center justify-between py-2 px-3 -mx-3 rounded-lg text-sm text-muted hover:text-foreground hover:bg-background/80 transition-colors group/link"
                                            >
                                                <span className="flex items-center gap-2 truncate">
                                                    <FileText size={14} className="opacity-50" />
                                                    <span className="truncate">{doc.data?.title}</span>
                                                </span>
                                                <ChevronRight size={14} className="opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all text-primary" />
                                            </Link>
                                        </li>
                                    ))}
                                </ul>

                                {hasMore && (
                                    <div className="pt-4 border-t border-border/50 relative z-10">
                                        <div className="text-xs font-bold text-primary flex items-center gap-1 w-fit opacity-80">
                                            + {items.length - 5} more articles
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
