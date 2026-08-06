// apexhub/app/community/tenancy/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { apex } from '@/lib/apexkit';
import { TenancyList } from '@/components/Community/TenancyList';
import { Loader2 } from 'lucide-react';

export default function TenancyPage() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apex.collection('tenancy_offers').list({ sort: '-created', expand: 'provider_id' })
            .then(res => setItems(res.items))
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex justify-center items-center min-h-[50vh]"><Loader2 className="animate-spin text-muted h-8 w-8" /></div>;
    return <TenancyList initialItems={items} />;
}