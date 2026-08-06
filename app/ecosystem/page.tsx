'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { apex } from '@/lib/apexkit';
import { EcosystemView } from '@/components/Ecosystem/EcosystemView';
import { Loader2 } from 'lucide-react';

function EcosystemContainer() {
    const searchParams = useSearchParams();
    const activeTab = searchParams.get('tab') || 'starters';
    const page = Number(searchParams.get('page')) || 1;
    const perPage = 12;

    const [data, setData] = useState<any>({
        showcase: { items: [], total: 0 },
        starters: { items: [], total: 0 },
        sharedItems: { items: [], total: 0 }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            setLoading(true);
            try {
                const [showcaseRes, startersRes, itemsRes] = await Promise.all([
                    apex.collection('showcase').list({ sort: '-created', page, per_page: perPage }),
                    apex.collection('starters').list({ sort: '-created', page, per_page: perPage }),
                    apex.collection('ecosystem_items').list({ sort: '-created', page, per_page: perPage, expand: 'author_id' })
                ]);
                if (isMounted) setData({ showcase: showcaseRes, starters: startersRes, sharedItems: itemsRes });
            } catch (e) {
                console.error(e);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchData();
        return () => { isMounted = false; };
    }, [page]);

    let totalItems = 0;
    if (activeTab === 'showcase') totalItems = data.showcase.total;
    else if (activeTab === 'community') totalItems = data.sharedItems.total;
    else totalItems = data.starters.total;
    const totalPages = Math.ceil(totalItems / perPage);

    if (loading) return <div className="flex justify-center items-center min-h-[60vh]"><Loader2 className="animate-spin text-muted h-8 w-8" /></div>;

    return (
        <EcosystemView
            initialTab={activeTab}
            showcaseData={data.showcase}
            startersData={data.starters}
            sharedData={data.sharedItems}
            currentPage={page}
            totalPages={totalPages}
        />
    );
}

export default function EcosystemPage() {
    return (
        <div className="p-6 md:p-12 max-w-7xl mx-auto min-h-screen">
            <Suspense fallback={<div className="flex justify-center items-center min-h-[60vh]"><Loader2 className="animate-spin text-muted h-8 w-8" /></div>}>
                <EcosystemContainer />
            </Suspense>
        </div>
    );
}