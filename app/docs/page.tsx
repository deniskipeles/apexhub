// =========================== /app/docs/page.tsx ===========================
import { apex } from '@/lib/apexkit';
import Link from 'next/link';
import { SearchBar } from '@/components/Docs/SearchBar';
import { getCategoryIcon } from '@/lib/icons';
import { Plus, BookOpen, ChevronRight, FileText, ChevronLeft, ArrowRight } from 'lucide-react';
import { Pagination } from '@/components/ui/Pagination'; // You'll need this helper

// Define Props for Server Component (Next.js 13+)
interface DocsPageProps {
  searchParams: {
    q?: string;
    page?: string;
    type?: 'instant' | 'vector';
  };
}

async function getDocsDirectory() {
  try {
    // Fetch a large batch to group by category for the directory view
    const res = await apex.collection('docs').list({ sort: 'title', per_page: 200 });
    const groups: Record<string, any[]> = {};
    res.items.forEach((doc: any) => {
        const cat = doc.data.category || 'general';
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(doc);
    });
    return { groups };
  } catch { return { groups: {} }; }
}

async function searchDocs(query: string, page: number, type: 'instant' | 'vector') {
  try {
    if (type === 'instant') {
        // Tantivy Search (No pagination support in SDK yet for instant search, usually top-k)
        // If your SDK supports limit, we use that. Assuming list returns all matches.
        // We will mock pagination on the returned list if backend doesn't support offset for instant-search
        const res = await apex.collection('docs').searchRecordsInstantlyWithOSE(query);
        // Manual pagination for instant search results
        const start = (page - 1) * 20;
        const end = start + 20;
        return {
            items: res.slice(start, end).map((r: any) => ({
                id: r.id,
                data: { title: r.snippet.title, content: r.snippet.content, category: 'search-result' }
            })),
            total: res.length
        };
    } else {
        // Vector Search (Usually top-k, hard to paginate deep)
        const res = await apex.collection('docs').searchTextVector(query, 20); // Get top 20
        return {
            items: res.map((r: any) => ({
                 id: r.id,
                 data: r.data,
                 _score: r._score
            })),
            total: res.length // Vector search usually returns fixed limit
        };
    }
  } catch {
      return { items: [], total: 0 };
  }
}

export const revalidate = 0; // Dynamic for search

export default async function DocsPage({ searchParams }: DocsPageProps) {
  const query = searchParams.q || "";
  const page = Number(searchParams.page) || 1;
  const type = searchParams.type || 'instant';

  // CONDITIONAL RENDER: Search Results OR Directory
  const isSearchMode = query.length > 0;
  
  let content;

  if (isSearchMode) {
      // --- SEARCH RESULTS VIEW ---
      const { items, total } = await searchDocs(query, page, type);
      const totalPages = Math.ceil(total / 20);

      content = (
          <div className="max-w-4xl mx-auto">
              <h2 className="text-lg font-semibold mb-6 text-muted">
                  Found {total} results for <span className="text-foreground">"{query}"</span>
              </h2>
              
              <div className="space-y-4">
                  {items.map((doc: any) => (
                      <Link key={doc.id} href={`/docs/${doc.id}`} className="block group">
                          <div className="bg-surface/30 border border-border rounded-xl p-6 hover:bg-surface/50 hover:border-primary/30 transition-all">
                              <div className="flex items-center justify-between mb-2">
                                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                                      {doc.data.title}
                                  </h3>
                                  <ChevronRight className="text-muted opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" size={18} />
                              </div>
                              <p className="text-muted text-sm line-clamp-2 leading-relaxed">
                                  {/* Strip HTML if snippet contains it */}
                                  {String(doc.data.content).replace(/<[^>]*>?/gm, '')}
                              </p>
                              <div className="flex items-center gap-2 mt-4 text-xs text-muted/60 font-mono">
                                  <span>ID: {doc.id}</span>
                                  {doc._score && <span>• Score: {(doc._score * 10).toFixed(1)}</span>}
                              </div>
                          </div>
                      </Link>
                  ))}
                  {items.length === 0 && (
                      <div className="text-center py-20 text-muted italic border border-dashed border-border rounded-xl">
                          No results found. Try a different query.
                      </div>
                  )}
              </div>

              {/* Pagination */}
              {total > 20 && (
                  <div className="mt-12 flex justify-center">
                      <Pagination totalPages={totalPages} currentPage={page} basePath={`/docs?q=${query}&type=${type}`} />
                  </div>
              )}
          </div>
      );
  } else {
      // --- DIRECTORY VIEW (Original Grid) ---
      const { groups } = await getDocsDirectory();
      const sortedCategories = Object.keys(groups).sort();

      content = (
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
                                            <span className="truncate">{doc.data.title}</span>
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
      );
  }

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-[1400px] mx-auto">
      
      {/* Universal Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-muted text-xs font-semibold tracking-wide uppercase mb-6">
             <BookOpen size={12} /> Knowledge Base
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight">Documentation</h1>
          
          <div className="max-w-2xl mx-auto mb-10">
              {/* Search Bar Updated to use URL Search Params */}
              <SearchBar initialQuery={query} initialType={type} />
          </div>

          <Link 
              href="/docs/new" 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-surface border border-border hover:border-primary/50 hover:bg-surface/80 text-sm font-medium text-foreground transition-all group"
          >
              <Plus size={16} className="text-primary group-hover:scale-110 transition-transform" /> Contribute a new guide
          </Link>
      </div>

      {content}

    </div>
  );
}