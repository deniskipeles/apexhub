'use client';

import { apex } from '@/lib/apexkit';
import { BlogPostView } from '@/components/Blog/BlogPostView';
import { notFound } from 'next/navigation';

async function getPost(id: string) {
    try {
        const post = await apex.collection('blog').get(id, { expand: 'author_id' });
        return post;
    } catch { return null; }
}

// export async function generateMetadata({ params }: { params: { id: string } }) {
//     const post = await getPost(params.id);
//     if (!post) return { title: 'Post Not Found' };
//     return { title: post.data.headline };
// }

export default async function BlogPostPage({ params }: { params: { id: string } }) {
    const post = await getPost(params.id);
    
    if (!post) notFound();

    return <BlogPostView post={post} content={post.data.body || ''} />;
}