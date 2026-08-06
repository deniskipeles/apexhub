import DocClientPage from './DocClientPage';

export const runtime = 'edge';

export default async function DocView({ params }: { params: { id: string } }) {
    return <DocClientPage id={params.id} />;
}