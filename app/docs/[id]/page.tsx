'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apex } from '@/lib/apexkit';
import { MarkdownRenderer } from '@/components/MarkdowRenderer';
import { DocsSidebar } from '@/components/Docs/DocsSidebar';
import { Share2, Calendar, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

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
    } catch (e) {
        console.error("Related docs fetch failed", e);
        return [];
    }
}

export default function DocView() {
    const { id } = useParams<{ id: string }>();
    const [data, setData] = useState<{ groups: Record<string, any[]>, doc: any, related: any[] } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const [listRes, docRes] = await Promise.all([
                    apex.collection('docs').list({ sort: 'title', per_page: 200 }),
                    apex.collection('docs').get(id, { expand: 'added_by' }).catch(() => null)
                ]);

                if (!docRes) {
                    setData(null);
                    return;
                }

                const related = await getRelatedDocs(id);

                const groups: Record<string, any[]> = {};
                listRes.items.forEach((d: any) => {
                    const cat = d.data.category || 'general';
                    if (!groups[cat]) groups[cat] = [];
                    groups[cat].push(d);
                });

                setData({ groups, doc: docRes, related });
            } catch (e) {
                console.error(e);
                setData(null);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [id]);

    if (loading) return <div className="flex justify-center items-center min-h-[50vh]"><Loader2 className="animate-spin text-muted h-8 w-8" /></div>;
    if (!data) return <div className="p-12 text-center text-muted">Doc Not Found</div>;

    const { groups, doc, related } = data;
    const authorName = doc.expand?.added_by?.email?.split('@')[0] || 'ApexTeam';

    return (
        <div className="flex flex-col md:flex-row min-h-screen">
            <div className="hidden md:block sticky top-0 h-screen overflow-y-auto">
                <DocsSidebar groups={groups} />
            </div>

            <article className="flex-1 min-w-0 p-6 md:p-12 md:max-w-4xl mx-auto">
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

                <MarkdownRenderer content={doc?.data?.content} />

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