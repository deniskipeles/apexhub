import OptimizationClientPage from './OptimizationClientPage';



export default async function OptimizationDetailPage({ params }: { params: { id: string } }) {
    return <OptimizationClientPage id={params.id} />;
}