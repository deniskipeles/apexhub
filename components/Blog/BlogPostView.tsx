'use client';

import React from 'react';
import Link from 'next/link';
import { getFileUrl } from '@/lib/apexkit';
import { Calendar, Clock, ArrowLeft, Share2, User, Tag } from 'lucide-react';

interface Props {
    post: any;
    contentHtml: string;
}

export function BlogPostView({ post, contentHtml }: Props) {
    const author = {
        name: post.expand?.author_id?.email?.split('@')[0] || 'ApexTeam',
        avatar: post.expand?.author_id?.metadata?.avatar ? getFileUrl(post.expand.author_id.metadata.avatar) : null
    };
    
    const coverImage = post.data.cover_image ? getFileUrl(post.data.cover_image) : null;

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-12 min-h-screen">
            <Link 
                href="/blog"
                className="flex items-center gap-2 text-muted hover:text-primary transition-colors mb-8 text-sm font-medium w-fit"
            >
                <ArrowLeft size={16} /> Back to Blog
            </Link>

            <div className="mb-8">
                <div className="flex items-center gap-4 text-sm text-muted mb-4 font-mono">
                    <span className="flex items-center gap-1.5">
                        <Calendar size={14} /> 
                        {new Date(post.created).toLocaleDateString()}
                    </span>
                    {post.data.read_time && (
                        <span className="flex items-center gap-1.5">
                            <Clock size={14} /> {post.data.read_time}
                        </span>
                    )}
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight tracking-tight">
                    {post.data.headline}
                </h1>
                <div className="flex items-center justify-between border-b border-border pb-8">
                        <div className="flex items-center gap-3">
                        {author.avatar ? (
                            <img src={author.avatar} alt={author.name} className="w-10 h-10 rounded-full border border-border object-cover" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center border border-border">
                                <User size={20} className="text-muted" />
                            </div>
                        )}
                        <div>
                            <div className="font-bold text-foreground text-sm">{author.name}</div>
                            <div className="text-xs text-muted">Author</div>
                        </div>
                    </div>
                    <button className="p-2 text-muted hover:text-foreground transition-colors hover:bg-surface rounded-full">
                        <Share2 size={20} />
                    </button>
                </div>
            </div>

            {coverImage && (
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden mb-12 border border-border shadow-lg">
                    <img src={coverImage} alt={post.data.headline} className="w-full h-full object-cover" />
                </div>
            )}

            <div 
                className="prose prose-lg prose-zinc dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: contentHtml }}
            />

            <div className="mt-12 pt-8 border-t border-border">
                <h3 className="text-sm font-bold text-muted uppercase mb-4 flex items-center gap-2">
                    <Tag size={14} /> Tags
                </h3>
                <div className="flex gap-2 flex-wrap">
                    {post.data.tags?.map((tag: string) => (
                        <span key={tag} className="px-3 py-1 bg-surface border border-border rounded-full text-sm text-muted font-medium hover:border-primary/30 transition-colors cursor-default">
                            #{tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}