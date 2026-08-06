import { apex } from '@/lib/apexkit';
import { BlogList } from '@/components/Blog/BlogList';

async function getPosts() {
    try {
        const res = await apex.collection('blog').list({ 
            sort: '-created', 
            expand: 'author_id',
            per_page: 20
        });
        return res.items;
    } catch { return []; }
}

export const revalidate = 60; // ISR

export default async function BlogPage() {
    const posts = await getPosts();
    return <BlogList initialPosts={posts} />;
}