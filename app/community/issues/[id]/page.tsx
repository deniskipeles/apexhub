import IssueClientPage from './IssueClientPage';

export const runtime = 'edge';

export default function IssueDetailPage({ params }: { params: { id: string } }) {
    return <IssueClientPage id={params.id} />;
}