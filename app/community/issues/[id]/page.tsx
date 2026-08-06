import IssueClientPage from './IssueClientPage';



export default async function IssueDetailPage({ params }: { params: { id: string } }) {
    return <IssueClientPage id={params.id} />;
}