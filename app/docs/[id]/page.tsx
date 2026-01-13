// =========================== /app/docs/[id]/page.tsx ===========================
import { apex } from '@/lib/apexkit';
import { renderMarkdown } from '@/lib/commonHelpers';
import { notFound } from 'next/navigation';
import { DocsSidebar } from '@/components/Docs/DocsSidebar'; // Sidebar reused here
import { Menu, Share2, Calendar, User } from 'lucide-react';
import Link from 'next/link';

// Fetch groups for sidebar AND specific doc
async function getData(id: string) {
    const [listRes, docRes] = await Promise.all([
        apex.collection('docs').list({ sort: 'title', per_page: 200 }),
        apex.collection('docs').get(id, { expand: 'added_by' }).catch(() => null)
    ]);

    if (!docRes) return null;

    const groups: Record<string, any[]> = {};
    listRes.items.forEach((d: any) => {
        const cat = d.data.category || 'general';
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(d);
    });

    return { groups, doc: docRes };
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
  
  const groups = data.groups;
  const doc:any = data.doc;
  const contentHtml = await renderMarkdown(doc.data.content);
  const authorName = doc.expand?.added_by?.email?.split('@')[0] || 'ApexTeam';

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
       
       {/* Sidebar - Visible on Desktop, Hidden on Mobile (add mobile toggle if needed) */}
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

            <div className="mt-16 pt-8 border-t border-border flex justify-end">
                <button className="flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors">
                    <Share2 size={16} /> Share this guide
                </button>
            </div>
       </article>
    </div>
  );
}