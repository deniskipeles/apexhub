'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { apex } from '@/lib/apexkit';
import { CareersView } from '@/components/Careers/CareersView';
import { Loader2 } from 'lucide-react';

function CareersContainer() {
    const searchParams = useSearchParams();
    const tab = searchParams.get('tab') || 'official';
    const query = searchParams.get('q') || '';
    const page = Number(searchParams.get('page')) || 1;

    const [data, setData] = useState({ items: [], total: 0, totalPages: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchJobs = async () => {
            setLoading(true);
            const collection = tab === 'official' ? 'careers' : 'jobs';
            const perPage = 10;
            try {
                let res;
                if (query) {
                    const searchRes = await apex.collection(collection).searchRecordsInstantlyWithOSE(query);
                    const allIds = searchRes.map((r: any) => r.id);
                    const offset = (page - 1) * perPage;
                    const pageIds = allIds.slice(offset, offset + perPage);
                    if (pageIds.length > 0) {
                        res = await apex.collection(collection).list({
                            page: 1, per_page: 25, expand: 'author_id', filter: JSON.stringify({ id: { $in: pageIds } })
                        });
                    } else {
                        res = { items: [], total: 0 };
                    }
                } else {
                    res = await apex.collection(collection).list({ sort: '-created', page, per_page: perPage, expand: 'author_id' });
                }
                if (isMounted) {
                    setData({ items: res.items || [], total: res.total || 0, totalPages: Math.ceil((res.total || 0) / perPage) });
                }
            } catch (e) {
                if (isMounted) setData({ items: [], total: 0, totalPages: 0 });
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchJobs();
        return () => { isMounted = false; };
    }, [tab, query, page]);

    if (loading) return <div className="flex justify-center items-center min-h-[60vh]"><Loader2 className="animate-spin text-muted h-8 w-8" /></div>;

    return (
        <CareersView
            initialData={data.items}
            totalItems={data.total}
            totalPages={data.totalPages}
            currentPage={page}
            currentTab={tab}
            currentQuery={query}
        />
    );
}

export default function CareersPage() {
    return (
        <div className="p-6 md:p-12 max-w-7xl mx-auto min-h-screen">
            <Suspense fallback={<div className="flex justify-center items-center min-h-[60vh]"><Loader2 className="animate-spin text-muted h-8 w-8" /></div>}>
                <CareersContainer />
            </Suspense>
        </div>
    );
}