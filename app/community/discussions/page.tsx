'use client';

import { apex } from '@/lib/apexkit';
import { DiscussionList } from '@/components/Community/DiscussionList'; // Client Component for search/create

async function getDiscussions() {
    try {
        const res = await apex.collection('discussions').list({ sort: '-created', expand: 'author_id' });
        return res.items;
    } catch { return []; }
}

// export const revalidate = 0;

export default async function DiscussionsPage() {
    const items = await getDiscussions();
    return <DiscussionList initialItems={items} />;
}