import { apex } from '@/lib/apexkit';
import { BlogPostView } from '@/components/Blog/BlogPostView';
import { notFound } from 'next/navigation';
import { renderMarkdown } from '@/lib/commonHelpers';

async function getPost(id: string) {
    try {
        const post = await apex.collection('blog').get(id, { expand: 'author_id' });
        return post;
    } catch { return null; }
}

export async function generateMetadata({ params }: { params: { id: string } }) {
    const post = await getPost(params.id);
    if (!post) return { title: 'Post Not Found' };
    return { title: post.data.headline };
}

export default async function BlogPostPage({ params }: { params: { id: string } }) {
    const post = await getPost(params.id);
    
    if (!post) notFound();

    // Render markdown on server
    const contentHtml = await renderMarkdown(post.data.body || '');

    return <BlogPostView post={post} contentHtml={contentHtml} />;
}