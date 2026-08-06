import EditBlogClientPage from './EditBlogClientPage';



export default async function EditBlogPage({ params }: { params: { id: string } }) {
    return <EditBlogClientPage id={params.id} />;
}