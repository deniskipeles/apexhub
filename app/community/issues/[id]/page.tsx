// apexhub/app/community/issues/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { apex } from '@/lib/apexkit';
import { RealtimeChat } from '@/components/Community/RealtimeChat';
import { Loader2 } from 'lucide-react';

export default function IssueDetailPage({ params }: { params: { id: string } }) {
    const [data, setData] = useState<{ issue: any, comments: any[] } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            apex.collection('issues').get(params.id, { expand: 'author_id' }),
            apex.collection('issues_conversations').list({
                filter: JSON.stringify({ issue_id: params.id }),
                sort: '-created',
                per_page: 20,
                expand: 'author_id'
            })
        ])
        .then(([issue, commentsRes]) => {
            setData({ issue, comments: commentsRes.items.reverse() });
        })
        .catch(() => setData(null))
        .finally(() => setLoading(false));
    }, [params.id]);

    if (loading) return <div className="flex justify-center items-center min-h-[50vh]"><Loader2 className="animate-spin text-muted h-8 w-8" /></div>;
    if (!data) return <div className="p-12 text-center text-muted">Issue not found</div>;

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