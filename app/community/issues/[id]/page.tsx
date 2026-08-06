import IssueClientPage from './IssueClientPage';

export const runtime = 'edge';

export default async function IssueDetailPage({ params }: { params: { id: string } }) {
    return <IssueClientPage id={params.id} />;
}