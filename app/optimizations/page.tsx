'use client';

import { apex } from '@/lib/apexkit';
import { OptimizationsView } from '@/components/Optimizations/OptimizationsView';
// import { Metadata } from 'next';

// export const metadata: Metadata = {
//     title: 'Performance Optimization Strategies | ApexHub',
//     description: 'Discover and share advanced performance tuning, caching, and database optimization strategies for modern backend engineering.',
//     keywords: ['performance', 'optimization', 'database', 'caching', 'rust', 'sqlite', 'backend scaling'],
//     openGraph: {
//         title: 'Performance Optimization Strategies | ApexHub',
//         description: 'Squeeze every drop of performance from your stack. Share and discuss techniques.',
//         type: 'website',
//     },
//     twitter: {
//         card: 'summary_large_image',
//         title: 'Optimization Strategies | ApexHub',
//         description: 'Discover and share advanced backend performance tuning.',
//     }
// };

async function getStrategies() {
    try {
        const res = await apex.collection('optimizations').list({ sort: '-upvotes', expand: 'author_id' });
        return res.items;
    } catch { return []; }
}

// export const revalidate = 60; // ISR for SEO

export default async function OptimizationsPage() {
    const strategies = await getStrategies();
    
    // Fetch user server-side to pass to client component safely
    let currentUser = null;
    try {
        const user = await apex.auth.getMe();
        if (user && user.id) currentUser = user;
    } catch(e) {}

    return (
        <div className="p-6 md:p-12 max-w-5xl mx-auto min-h-screen">
            <OptimizationsView initialStrategies={strategies} currentUser={currentUser} />
        </div>
    );
}