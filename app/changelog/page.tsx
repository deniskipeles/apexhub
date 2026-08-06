import { apex } from '@/lib/apexkit';
import { ChangelogView } from '@/components/Changelog/ChangelogView';

async function getReleases() {
    try {
        const res = await apex.collection('changelog').list({ sort: '-release_date' });
        return res.items;
    } catch { return []; }
}

export const revalidate = 60; // ISR

export default async function ChangelogPage() {
    const releases = await getReleases();
    return <ChangelogView releases={releases} />;
}