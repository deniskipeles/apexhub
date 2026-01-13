// =========================== /app/docs/page.tsx ===========================
import { apex } from '@/lib/apexkit';
import Link from 'next/link';
import { SearchBar } from '@/components/Docs/SearchBar';
import { getCategoryIcon } from '@/lib/icons';
import { Plus, ArrowRight, BookOpen } from 'lucide-react';

async function getDocs() {
  try {
    const res = await apex.collection('docs').list({ sort: 'title', per_page: 200 });
    
    const groups: Record<string, any[]> = {};
    res.items.forEach((doc: any) => {
        const cat = doc.data.category || 'general';
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(doc);
    });
    return groups;
  } catch (e) {
    return {};
  }
}

export const revalidate = 60;

export default async function DocsIndexPage() {
  const groups = await getDocs();
  const sortedCategories = Object.keys(groups).sort();

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-muted text-xs font-semibold tracking-wide uppercase mb-6">
             <BookOpen size={12} /> Knowledge Base
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Documentation</h1>
          <p className="text-xl text-muted leading-relaxed mb-8">
              Everything you need to build, deploy, and scale with ApexKit.
          </p>
          
          <div className="max-w-xl mx-auto mb-8">
              <SearchBar />
          </div>

          <Link 
              href="/docs/new" 
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
          >
              <Plus size={16} /> Contribute a new guide
          </Link>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedCategories.map(category => {
              const Icon = getCategoryIcon(category);
              const items = groups[category];
              const displayItems = items.slice(0, 5); // Show top 5

              return (
                  <div key={category} className="bg-surface/30 border border-border rounded-2xl p-6 hover:border-primary/30 transition-all group">
                      <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 bg-background rounded-lg border border-border text-muted group-hover:text-primary transition-colors">
                              <Icon size={20} />
                          </div>
                          <h2 className="text-xl font-bold text-foreground capitalize">
                              {category.replace(/-/g, ' ')}
                          </h2>
                      </div>
                      
                      <ul className="space-y-3 mb-6">
                          {displayItems.map((doc: any) => (
                              <li key={doc.id}>
                                  <Link 
                                      href={`/docs/${doc.id}`}
                                      className="flex items-center justify-between text-sm text-muted hover:text-foreground group/link"
                                  >
                                      <span className="truncate">{doc.data.title}</span>
                                      <ChevronRight size={14} className="opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all" />
                                  </Link>
                              </li>
                          ))}
                      </ul>

                      {items.length > 5 && (
                          <div className="pt-4 border-t border-border/50">
                              <span className="text-xs text-muted font-medium">
                                  + {items.length - 5} more articles
                              </span>
                          </div>
                      )}
                  </div>
              );
          })}
      </div>
    </div>
  );
}

// Helper icon component since we are in a server file
import { ChevronRight } from 'lucide-react';