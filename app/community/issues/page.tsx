import { apex } from '@/lib/apexkit';
import { IssueList } from '@/components/Community/IssueList';

async function getIssues() {
    try {
        const res = await apex.collection('issues').list({ sort: '-created', expand: 'author_id' });
        return res.items;
    } catch { return []; }
}

export const revalidate = 0;

export default async function IssuesPage() {
    const items = await getIssues();
    return <IssueList initialItems={items} />;
}