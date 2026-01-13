import { apex } from '@/lib/apexkit';
import { OptimizationsView } from '@/components/Optimizations/OptimizationsView';

async function getStrategies() {
    try {
        const res = await apex.collection('optimizations').list({ sort: '-upvotes', expand: 'author_id' });
        return res.items;
    } catch { return []; }
}

export const revalidate = 0;

export default async function OptimizationsPage() {
    const strategies = await getStrategies();

    return (
        <div className="p-6 md:p-12 max-w-5xl mx-auto min-h-screen">
            <OptimizationsView initialStrategies={strategies} />
        </div>
    );
}