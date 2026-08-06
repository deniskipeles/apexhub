import BlogClientPage from './BlogClientPage';



export default async function BlogPostPage({ params }: { params: { id: string } }) {
    return <BlogClientPage id={params.id} />;
}