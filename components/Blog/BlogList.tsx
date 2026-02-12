'use client';

import React from 'react';
import Link from 'next/link';
import { getFileUrl } from '@/lib/apexkit';
import { BookOpen, Plus, User } from 'lucide-react';

export function BlogList({ initialPosts }: { initialPosts: any[] }) {
    const featuredPost = initialPosts[0];
    const otherPosts = initialPosts.slice(1);

    const getAuthor = (post: any) => {
        const u = post.expand?.author_id;
        return {
            name: u?.email?.split('@')[0] || 'ApexTeam',
            avatar: u?.metadata?.avatar ? getFileUrl(u.metadata.avatar) : null
        };
    };

    const getImage = (filename?: string) => filename ? getFileUrl(filename) : null;

    return (
        <div className="p-6 md:p-12 max-w-7xl mx-auto min-h-screen">
            <div className="mb-16 text-center max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-muted text-xs font-semibold tracking-wide uppercase mb-6">
                    <BookOpen size={12} /> Engineering Blog
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
                    Insights from the team
                </h1>
                <p className="text-lg text-muted leading-relaxed">
                    Deep dives into database internals, Rust optimizations, and the future of vertical scaling.
                </p>
                {/* [NEW] Create Button */}
                <Link href="/blog/new" className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-all shadow-lg shadow-primary/20">
                    <Plus size={18} /> Write Post
                </Link>
            </div>

            {initialPosts.length === 0 ? (
                <div className="text-center py-20 bg-surface/20 border border-dashed border-border rounded-3xl">
                    <BookOpen size={48} className="mx-auto text-muted/30 mb-4" />
                    <h3 className="text-lg font-bold text-foreground">No posts yet</h3>
                    <p className="text-muted">Check back soon for updates.</p>
                </div>
            ) : (
                <>
                    {/* Featured Post */}
                    {featuredPost && (() => {
                        const author = getAuthor(featuredPost);
                        const cover = getImage(featuredPost.data.cover_image);
                        return (
                            <Link href={`/blog/${featuredPost.id}`}>
                                <div className="group relative grid grid-cols-1 md:grid-cols-2 gap-8 bg-surface/30 border border-border rounded-3xl p-6 md:p-8 mb-16 hover:bg-surface/50 hover:border-primary/30 transition-all hover:shadow-xl cursor-pointer">
                                    <div className="relative aspect-video md:aspect-auto rounded-xl overflow-hidden bg-black/20">
                                        {cover ? (
                                            <img src={cover} alt={featuredPost.data.headline} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted/20">
                                                <BookOpen size={64} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <div className="flex items-center gap-3 text-sm text-primary font-bold uppercase tracking-wider mb-4">
                                            <span>Latest Post</span>
                                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                                        </div>
                                        <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors leading-tight">
                                            {featuredPost.data.headline}
                                        </h2>
                                        <p className="text-muted text-lg mb-6 line-clamp-3 leading-relaxed">
                                            {featuredPost.data.subheadline}
                                        </p>
                                        <div className="flex items-center gap-3 mt-auto pt-4 border-t border-border/50">
                                            {author.avatar ? (
                                                <img src={author.avatar} className="w-8 h-8 rounded-full border border-border object-cover" alt={author.name} />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center border border-border"><User size={14} /></div>
                                            )}
                                            <span className="text-sm font-bold text-foreground">{author.name}</span>
                                            <span className="text-sm text-muted">• {new Date(featuredPost.created).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })()}

                    {/* Post Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {otherPosts.map(post => {
                            const author = getAuthor(post);
                            const cover = getImage(post.data.cover_image);
                            return (
                                <Link key={post.id} href={`/blog/${post.id}`}>
                                    <div className="group flex flex-col bg-surface/30 border border-border rounded-2xl overflow-hidden hover:bg-surface hover:border-primary/30 transition-all hover:shadow-lg hover:-translate-y-1 duration-300 h-full">
                                        <div className="aspect-[16/10] overflow-hidden bg-black/20 relative">
                                            {cover ? (
                                                <img src={cover} alt={post.data.headline} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-muted/20"><BookOpen size={32} /></div>
                                            )}
                                        </div>
                                        <div className="p-6 flex flex-col flex-1 relative">
                                            <div className="flex gap-2 mb-4 flex-wrap">
                                                {post.data.tags?.slice(0, 2).map((tag: string) => (
                                                    <span key={tag} className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-background border border-border text-muted">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                            <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors leading-snug">
                                                {post.data.headline}
                                            </h3>
                                            <p className="text-sm text-muted line-clamp-2 mb-6 flex-1 leading-relaxed">
                                                {post.data.subheadline}
                                            </p>
                                            <div className="flex items-center justify-between pt-4 border-t border-border/50">
                                                <div className="flex items-center gap-2 text-xs font-bold text-muted">
                                                    <User size={12} /> {author.name}
                                                </div>
                                                <div className="text-xs text-muted font-mono">
                                                    {new Date(post.created).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}