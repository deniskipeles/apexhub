import { apex } from '@/lib/apexkit';
import { RealtimeChat } from '@/components/Community/RealtimeChat';
import { notFound } from 'next/navigation';

async function getData(id: string) {
    try {
        // 1. Fetch Parent
        const discussion = await apex.collection('discussions').get(id, { expand: 'author_id' });
        
        // 2. Fetch Comments (Latest 20)
        // We assume a collection 'discussions_conversations' with field 'discussion_id'
        const commentsRes = await apex.collection('discussions_conversations').list({
            filter: JSON.stringify({ discussion_id: id }),
            sort: '-created', // Newest first
            per_page: 20,
            expand: 'author_id'
        });

        // Reverse to show oldest first in chat UI (standard chat flow)
        // But since we fetched newest first for pagination, we reverse array
        const comments = commentsRes.items.reverse();

        return { discussion, comments };
    } catch {
        return null;
    }
}

export default async function DiscussionDetailPage({ params }: { params: { id: string } }) {
    const data = await getData(params.id);
    if (!data) notFound();

    return (
        <RealtimeChat 
            parentId={params.id}
            parentData={data.discussion}
            initialComments={data.comments}
            collectionName="discussions_conversations" // Target collection for chats
            parentField="discussion_id"                // Foreign key field
            channel={`discussion_${params.id}`}        // WS Channel
        />
    );
}