// apexhub/app/optimizations/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { apex } from '@/lib/apexkit';
import { OptimizationsView } from '@/components/Optimizations/OptimizationsView';
import { Loader2 } from 'lucide-react';

export default function OptimizationsPage() {
    const [strategies, setStrategies] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            apex.collection('optimizations').list({ sort: '-upvotes', expand: 'author_id' }),
            apex.auth.getMe().catch(() => null)
        ])
        .then(([res, user]) => {
            setStrategies(res.items);
            if (user && user.id) setCurrentUser(user);
        })
        .catch(() => setStrategies([]))
        .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex justify-center items-center min-h-[50vh]"><Loader2 className="animate-spin text-muted h-8 w-8" /></div>;

    return (
        <div className="p-6 md:p-12 max-w-5xl mx-auto min-h-screen">
            <OptimizationsView initialStrategies={strategies} currentUser={currentUser} />
        </div>
    );
}