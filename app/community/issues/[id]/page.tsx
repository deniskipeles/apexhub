import { apex } from '@/lib/apexkit';
import { RealtimeChat } from '@/components/Community/RealtimeChat';
import { notFound } from 'next/navigation';

async function getData(id: string) {
    try {
        // 1. Fetch Issue
        const issue = await apex.collection('issues').get(id, { expand: 'author_id' });
        
        // 2. Fetch Comments (Latest 20)
        // Assumes collection 'issues_conversations' exists with field 'issue_id'
        const commentsRes = await apex.collection('issues_conversations').list({
            filter: JSON.stringify({ issue_id: id }),
            sort: '-created',
            per_page: 20,
            expand: 'author_id'
        });

        const comments = commentsRes.items.reverse();

        return { issue, comments };
    } catch {
        return null;
    }
}

export const revalidate = 0; // Dynamic

export default async function IssueDetailPage({ params }: { params: { id: string } }) {
    const data = await getData(params.id);
    if (!data) notFound();

    return (
        <RealtimeChat 
            parentId={params.id}
            parentData={data.issue}
            initialComments={data.comments}
            collectionName="issues_conversations" 
            parentField="issue_id"                
            channel={`issue_${params.id}`}        
        />
    );
}