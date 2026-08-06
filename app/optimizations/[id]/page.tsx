import React from 'react';
import { apex, getFileUrl } from '@/lib/apexkit';
import { RealtimeChat } from '@/components/Community/RealtimeChat';
import { notFound } from 'next/navigation';
import { Metadata, ResolvingMetadata } from 'next';
import { ArrowLeft, User, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { MarkdownRenderer } from '@/components/MarkdowRenderer';

// 1. Fetch Data
async function getData(id: string) {
    try {
        // Fetch Strategy
        const strategy = await apex.collection('optimizations').get(id, { expand: 'author_id' });

        // Fetch Comments (Assuming collection 'optimizations_conversations')
        // Create this collection in your DB if it doesn't exist, similar to discussions_conversations
        const commentsRes = await apex.collection('optimizations_conversations').list({
            filter: JSON.stringify({ optimization_id: id }),
            sort: '-created',
            per_page: 20,
            expand: 'author_id'
        });

        const comments = commentsRes.items.reverse();

        return { strategy, comments };
    } catch {
        return null;
    }
}

// 2. Generate Dynamic SEO Metadata
export async function generateMetadata(
    { params }: { params: { id: string } },
    parent: ResolvingMetadata
): Promise<Metadata> {
    const data = await getData(params.id);

    if (!data) {
        return { title: 'Not Found | ApexHub' };
    }

    const title = `${data.strategy.data.title} | ApexHub Optimizations`;
    const description = String(data.strategy.data.content).substring(0, 160) + '...';

    return {
        title,
        description,
        keywords: data.strategy.data.tags || ['performance', 'optimization'],
        openGraph: {
            title,
            description,
            type: 'article',
        },
        twitter: {
            card: 'summary',
            title,
            description,
        }
    };
}

// Opt-in the entire application to the Edge Runtime (required for Cloudflare Pages)
export const runtime = 'edge';
export const revalidate = 60; // ISR for SEO freshness

// 3. Render Page
export default async function OptimizationDetailPage({ params }: { params: { id: string } }) {
    const data = await getData(params.id);

    if (!data) notFound();

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

            {/* Strategy Content (SSR for SEO) */}
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

                {/* Pre-rendered content for crawlers */}
                <MarkdownRenderer content={strategy.data?.content || ''} className="prose prose-zinc dark:prose-invert max-w-none font-mono text-sm opacity-90 whitespace-pre-wrap" />
            </article>

            {/* Interactive Realtime Chat */}
            <div className="flex-1 bg-surface/10 border border-border rounded-2xl p-4 md:p-6 shadow-inner">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                    <TrendingUp size={18} className="text-primary" /> Discussion
                </h3>

                {/* Note: Ensure you have an 'optimizations_conversations' collection in your DB 
                    that points to 'optimization_id' */}
                <RealtimeChat
                    parentId={strategy.id.toString()}
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