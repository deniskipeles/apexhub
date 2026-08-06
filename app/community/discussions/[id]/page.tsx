import DiscussionClientPage from './DiscussionClientPage';

export const runtime = 'edge';

export default function DiscussionDetailPage({ params }: { params: { id: string } }) {
    return <DiscussionClientPage id={params.id} />;
}