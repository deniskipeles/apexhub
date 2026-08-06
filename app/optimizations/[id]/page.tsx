import OptimizationClientPage from './OptimizationClientPage';

export const runtime = 'edge';

export default function OptimizationDetailPage({ params }: { params: { id: string } }) {
    return <OptimizationClientPage id={params.id} />;
}