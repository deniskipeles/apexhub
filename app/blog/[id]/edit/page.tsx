import { apex } from '@/lib/apexkit';
import { BlogEditor } from '@/components/Blog/BlogEditor';
import { notFound } from 'next/navigation';

// Opt-in the entire application to the Edge Runtime (required for Cloudflare Pages)
export const runtime = 'edge';
export default async function EditBlogPage({ params }: { params: { id: string } }) {
    try {
        const post = await apex.collection('blog').get(params.id);
        return <BlogEditor initialData={post} />;
    } catch {
        notFound();
    }
}