import BlogClientPage from './BlogClientPage';

export const runtime = 'edge';

export default async function BlogPostPage({ params }: { params: { id: string } }) {
    return <BlogClientPage id={params.id} />;
}