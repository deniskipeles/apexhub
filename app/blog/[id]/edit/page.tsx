import { apex } from '@/lib/apexkit';
import { BlogEditor } from '@/components/Blog/BlogEditor';
import { notFound } from 'next/navigation';

export default async function EditBlogPage({ params }: { params: { id: string } }) {
    try {
        const post = await apex.collection('blog').get(params.id);
        return <BlogEditor initialData={post} />;
    } catch {
        notFound();
    }
}