'use client';

import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { apex, getFileUrl } from '@/lib/apexkit';
import { RealtimeChat } from '@/components/Community/RealtimeChat';
import { ArrowLeft, User, TrendingUp, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { MarkdownRenderer } from '@/components/MarkdowRenderer';

export default function OptimizationDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [data, setData] = useState<{ strategy: any, comments: any[] } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            apex.collection('optimizations').get(id, { expand: 'author_id' }),
            apex.collection('optimizations_conversations').list({
                filter: JSON.stringify({ optimization_id: id }),
                sort: '-created',
                per_page: 20,
                expand: 'author_id'
            })
        ])
        .then(([strategy, commentsRes]) => {
            setData({ strategy, comments: commentsRes.items.reverse() });
        })
        .catch(() => setData(null))
        .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="flex justify-center items-center min-h-[50vh]"><Loader2 className="animate-spin text-muted h-8 w-8" /></div>;
    if (!data) return <div className="p-12 text-center text-muted">Strategy not found</div>;

    const { strategy, comments } = data;
    const author: any = strategy.expand ? strategy.expand : {};
    const authorName = author?.email?.split('@')[0] || 'Anonymous';
    const authorAvatar = author?.metadata?.avatar
        ? getFileUrl(author.author_id.metadata.avatar)
        : null;

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-12 min-h-screen flex flex-col">
            <Link
                href="/optimizations"
                className="flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors mb-8 w-fit"
            >
                <ArrowLeft size={16} /> Back to Optimizations
            </Link>

            <article className="bg-surface/30 border border-border rounded-2xl p-6 md:p-8 mb-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6 border-b border-border/50 pb-6">
                    {authorAvatar ? (
                        <img src={authorAvatar} alt={authorName} className="w-12 h-12 rounded-full border border-border object-cover" />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-muted border border-border">
                            <User size={24} />
                        </div>
                    )}
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 leading-tight">
                            {strategy.data.title}
                        </h1>
                        <div className="flex items-center gap-2 text-xs text-muted">
                            <span className="font-medium text-foreground">{authorName}</span>
                            <span>•</span>
                            <span>{new Date(strategy.created).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                    {strategy.data.tags?.map((tag: string) => (
                        <span key={tag} className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-background border border-border text-muted">
                            {tag}
                        </span>
                    ))}
                </div>

                <MarkdownRenderer content={strategy.data?.content || ''} className="prose prose-zinc dark:prose-invert max-w-none font-mono text-sm opacity-90 whitespace-pre-wrap" />
            </article>

            <div className="flex-1 bg-surface/10 border border-border rounded-2xl p-4 md:p-6 shadow-inner">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                    <TrendingUp size={18} className="text-primary" /> Discussion
                </h3>
                <RealtimeChat
                    parentId={id}
                    parentData={strategy}
                    initialComments={comments}
                    collectionName="optimizations_conversations"
                    parentField="optimization_id"
                    channel={`opt_${strategy.id}`}
                />
            </div>
        </div>
    );
}