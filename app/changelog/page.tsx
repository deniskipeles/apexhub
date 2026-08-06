// apexhub/app/changelog/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { apex } from '@/lib/apexkit';
import { ChangelogView } from '@/components/Changelog/ChangelogView';
import { Loader2 } from 'lucide-react';

export default function ChangelogPage() {
    const [releases, setReleases] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apex.collection('changelog').list({ sort: '-release_date' })
            .then(res => setReleases(res.items))
            .catch(() => setReleases([]))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex justify-center items-center min-h-[50vh]"><Loader2 className="animate-spin text-muted h-8 w-8" /></div>;
    return <ChangelogView releases={releases} />;
}