import { getApexServer } from '@/lib/apexkit';
import { CareersView } from '@/components/Careers/CareersView';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Careers & Jobs | ApexHub',
    description: 'Join the team or find opportunities in the ApexKit ecosystem.',
};

export const dynamic = 'force-dynamic'; // Ensure params update

async function getJobsData(tab: string, query: string, page: number) {
    const apex = await getApexServer();
    const perPage = 10;
    const offset = (page - 1) * perPage;

    try {
        // Determine collection based on tab
        const collection = tab === 'official' ? 'careers' : 'jobs';

        let items = [];
        let total = 0;

        if (query) {
            // Use Instant Search (Tantivy) for speed if searching
            // Note: Instant search usually doesn't support deep pagination well via offset in some configs, 
            // but we will use the standard list with filter if available or just slice the search results manually if the SDK returns all.
            // Assuming SDK 'searchRecordsInstantlyWithOSE' returns all matches or we slice locally.
            // For true pagination with search, 'searchRecordsWithSQL' or specific vector search is used.
            // Let's use the standard list with 'filter' if possible, or fallback to search.

            // Using OSE Search (Returns { id, score, snippet }) - we need full records
            // Better: Use `list` with a filter query if possible, or fetch IDs then get records.
            // For simplicity here, let's use list with a basic text filter if supported, 
            // OR just fetch all and filter in memory if dataset small (Careers usually small).

            // REAL APPROACH: Fetch search results IDs then fetch records
            const searchRes = await apex.collection(collection).searchRecordsInstantlyWithOSE(query);
            const allIds = searchRes.map((r: any) => r.id);
            total = allIds.length;

            // Slice IDs for current page
            const pageIds = allIds.slice(offset, offset + perPage);

            if (pageIds.length > 0) {
                const res = await apex.collection(collection).list({
                    sort: '-created',
                    page: 1,
                    per_page: 25,
                    expand: 'author_id',
                    filter: JSON.stringify({ id: { $in: pageIds } })
                });
                items = res.items;
                total = res.total;
            }
        } else {
            // Standard List
            const res = await apex.collection(collection).list({
                sort: '-created',
                page,
                per_page: perPage,
                expand: 'author_id'
            });
            items = res.items;
            total = res.total;
        }

        return { items, total, totalPages: Math.ceil(total / perPage) };

    } catch (e) {
        console.error("Careers fetch failed", e);
        return { items: [], total: 0, totalPages: 0 };
    }
}

interface PageProps {
    searchParams: { [key: string]: string | string[] | undefined };
}

export default async function CareersPage({ searchParams }: PageProps) {
    const tab = (searchParams.tab as string) || 'official';
    const query = (searchParams.q as string) || '';
    const page = Number(searchParams.page) || 1;

    const data = await getJobsData(tab, query, page);

    return (
        <div className="p-6 md:p-12 max-w-7xl mx-auto min-h-screen">
            <CareersView
                initialData={data.items}
                totalItems={data.total}
                totalPages={data.totalPages}
                currentPage={page}
                currentTab={tab}
                currentQuery={query}
            />
        </div>
    );
}