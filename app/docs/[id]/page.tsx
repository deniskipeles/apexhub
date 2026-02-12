import { apex } from '@/lib/apexkit';
import { renderMarkdown } from '@/lib/commonHelpers';
import { notFound } from 'next/navigation';
import { DocsSidebar } from '@/components/Docs/DocsSidebar'; // Sidebar reused here
import { Menu, Share2, Calendar, User, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

// Helper to find related content using stored vectors (No CPU re-embedding)
async function getRelatedDocs(id: string) {
    try {
        // 1. Get raw vectors stored for this record
        const vectors = await apex.collection('docs').getVector(id);
        console.log("raw vectors", vectors)
        
        if (!vectors || vectors.length === 0) return [];

        // 2. Use the first vector found to search (usually 'content' or 'title')
        const target = vectors[0];
        
        // 3. Perform HNSW Similarity Search
        const results = await apex.collection('docs').searchVector(
            target.field_name, 
            target.vector, 
            5 // Fetch 4 to allow filtering self
        );

        console.log("HNSW Similarity Search", results)

        // 4. Filter out the current document
        return results
            .filter((r: any) => r.id.toString() !== id.toString())
            .slice(0, 3);
            
    } catch (e) {
        console.error("Related docs fetch failed", e);
        return [];
    }
}

// Fetch groups for sidebar AND specific doc AND related content
async function getData(id: string) {
    const [listRes, docRes] = await Promise.all([
        apex.collection('docs').list({ sort: 'title', per_page: 200 }),
        apex.collection('docs').get(id, { expand: 'added_by' }).catch(() => null)
    ]);

    if (!docRes) return null;

    // Fetch related content in parallel after confirming doc exists
    // We don't block the main render on this if it fails
    const related = await getRelatedDocs(id);

    const groups: Record<string, any[]> = {};
    listRes.items.forEach((d: any) => {
        const cat = d.data.category || 'general';
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(d);
    });

    return { groups, doc: docRes, related };
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  try {
    const doc = await apex.collection('docs').get(params.id) as any;
    const title = doc.data ? doc.data?.title : ''
    return { title: `${title} - ApexHub Docs` };
  } catch {
    return { title: 'Doc Not Found' };
  }
}

export default async function DocView({ params }: { params: { id: string } }) {
  const data = await getData(params.id);
  
  if (!data) notFound();
  
  const { groups, doc, related } = data;
  const contentHtml = await renderMarkdown(doc.data.content);
  const authorName = doc.expand?.added_by?.email?.split('@')[0] || 'ApexTeam';

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
       
       {/* Sidebar - Visible on Desktop */}
       <div className="hidden md:block sticky top-0 h-screen overflow-y-auto">
           <DocsSidebar groups={groups} />
       </div>

       {/* Main Content */}
       <article className="flex-1 min-w-0 p-6 md:p-12 md:max-w-4xl mx-auto">
           {/* Breadcrumb / Nav */}
           <div className="mb-8 flex items-center gap-2 text-sm text-muted">
               <Link href="/docs" className="hover:text-foreground transition-colors">Docs</Link>
               <span>/</span>
               <span className="capitalize">{doc.data.category}</span>
           </div>

           <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground tracking-tight">{doc.data.title}</h1>
           
           <div className="flex items-center gap-4 text-sm text-muted mb-12 pb-8 border-b border-border">
               <div className="flex items-center gap-2">
                   <div className="w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center text-[10px] font-bold">
                       {authorName[0].toUpperCase()}
                   </div>
                   <span>{authorName}</span>
               </div>
               <span>•</span>
               <span className="flex items-center gap-1.5">
                   <Calendar size={14} /> {new Date(doc.created).toLocaleDateString()}
               </span>
           </div>

           <div 
               className="prose prose-zinc dark:prose-invert max-w-none" 
               dangerouslySetInnerHTML={{ __html: contentHtml }} 
           />
            
            {/* Related Content Section */}
            {related.length > 0 && (
                <div className="mt-16 pt-10 border-t border-border">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-foreground">
                        <Sparkles className="h-4 w-4 text-primary" /> Related Guides
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {related.map((item: any) => (
                            <Link 
                                key={item.id} 
                                href={`/docs/${item.id}`}
                                className="group p-4 rounded-xl border border-border bg-surface/30 hover:bg-surface hover:border-primary/30 transition-all flex flex-col h-full"
                            >
                                <span className="text-xs font-bold text-muted uppercase tracking-wider mb-2">
                                    {item.data.category || 'Guide'}
                                </span>
                                <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">
                                    {item.data.title}
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
                <button className="flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors">
                    <Share2 size={16} /> Share this guide
                </button>
            </div>
       </article>
    </div>
  );
}