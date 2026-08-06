'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apex } from '@/lib/apexkit';
import { RealtimeChat } from '@/components/Community/RealtimeChat';
import { Loader2 } from 'lucide-react';

export default function DiscussionDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [data, setData] = useState<{ discussion: any, comments: any[] } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            apex.collection('discussions').get(id, { expand: 'author_id' }),
            apex.collection('discussions_conversations').list({
                filter: JSON.stringify({ discussion_id: id }),
                sort: '-created',
                per_page: 20,
                expand: 'author_id'
            })
        ])
        .then(([discussion, commentsRes]) => {
            setData({ discussion, comments: commentsRes.items.reverse() });
        })
        .catch((err) => { console.error("Failed to load discussion details", err); setData(null); })
        .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="flex justify-center items-center min-h-[50vh]"><Loader2 className="animate-spin text-muted h-8 w-8" /></div>;
    if (!data) return <div className="p-12 text-center text-muted">Discussion not found</div>;

    return (
        <RealtimeChat
            parentId={id}
            parentData={data.discussion}
            initialComments={data.comments}
            collectionName="discussions_conversations"
            parentField="discussion_id"
            channel={`discussion_${id}`}
        />
    );
}