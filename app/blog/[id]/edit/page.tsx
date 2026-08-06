import EditBlogClientPage from './EditBlogClientPage';

export const runtime = 'edge';

export default function EditBlogPage({ params }: { params: { id: string } }) {
    return <EditBlogClientPage id={params.id} />;
}