// apexhub/app/community/issues/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { apex } from '@/lib/apexkit';
import { IssueList } from '@/components/Community/IssueList';
import { Loader2 } from 'lucide-react';

export default function IssuesPage() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apex.collection('issues').list({ sort: '-created', expand: 'author_id' })
            .then(res => setItems(res.items))
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex justify-center items-center min-h-[50vh]"><Loader2 className="animate-spin text-muted h-8 w-8" /></div>;
    return <IssueList initialItems={items} />;
}