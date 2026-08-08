import { getApexServer } from '@/lib/apexkit'; 
import { EcosystemView } from '@/components/Ecosystem/EcosystemView';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ecosystem | ApexHub',
  description: 'Community shared starters, scripts, and templates.',
};

// Prevent caching to ensure we get fresh data/auth state on every request
export const dynamic = 'force-dynamic';

async function getData(page: number, perPage: number) {
  // 1. Get request-scoped client (Authenticated)
  const apex = await getApexServer();

  try {
    const [showcaseRes, startersRes, itemsRes] = await Promise.all([
      apex.collection('showcase').list({ sort: '-created', page, per_page: perPage }),
      apex.collection('starters').list({ sort: '-created', page, per_page: perPage }),
      // The shared code collection
      apex.collection('ecosystem_items').list({
        sort: '-created',
        page,
        per_page: perPage,
        expand: 'author_id'
      })
    ]);

    return {
      showcase: showcaseRes,
      starters: startersRes,
      sharedItems: itemsRes
    };
  } catch (e) {
    console.error("Ecosystem fetch failed", e);
    // Return structure matching ListResult
    const empty = { items: [], total: 0, page: 1, per_page: perPage };
    return { showcase: empty, starters: empty, sharedItems: empty };
  }
}

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function EcosystemPage({ searchParams }: PageProps) {
  // 1. Parse Query Params
  const activeTab = (searchParams.tab as string) || 'starters';
  const page = Number(searchParams.page) || 1;
  const perPage = 12; // Grid of 3 columns x 4 rows

  // 2. Fetch Data
  const { showcase, starters, sharedItems } = await getData(page, perPage);

  // 3. Determine active pagination data based on tab
  // (We fetch all for simplicity, but you could optimize to fetch only active tab)
  let totalItems = 0;
  if (activeTab === 'showcase') totalItems = showcase.total;
  else if (activeTab === 'community') totalItems = sharedItems.total;
  else totalItems = starters.total;

  const totalPages = Math.ceil(totalItems / perPage);

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto min-h-screen">
      <EcosystemView
        initialTab={activeTab}
        // Pass the full ListResult objects now, not just .items
        showcaseData={showcase}
        startersData={starters}
        sharedData={sharedItems}
        // Pagination Props
        currentPage={page}
        totalPages={totalPages}
      />
    </div>
  );
}