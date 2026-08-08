import { getApexServer } from '@/lib/apexkit'; 
import { EcosystemView } from '@/components/Ecosystem/EcosystemView';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ecosystem & Community | ApexHub',
  description: 'Community shared starters, scripts, templates, discussions, issues, and tenancy market.',
};

// Prevent caching to ensure we get fresh data/auth state on every request
export const dynamic = 'force-dynamic';

async function getData(tab: string, page: number, perPage: number) {
  const apex = await getApexServer();

  let showcase = { items: [], total: 0 };
  let starters = { items: [], total: 0 };
  let sharedCode = { items: [], total: 0 };
  let discussions = { items: [], total: 0 };
  let issues = { items: [], total: 0 };
  let tenancy = { items: [], total: 0 };

  try {
    if (tab === 'showcase') {
      showcase = await apex.collection('showcase').list({ sort: '-created', page, per_page: perPage });
    } else if (tab === 'code') {
      sharedCode = await apex.collection('ecosystem_items').list({ sort: '-created', page, per_page: perPage, expand: 'author_id' });
    } else if (tab === 'discussions') {
      discussions = await apex.collection('discussions').list({ sort: '-created', page: 1, per_page: 50, expand: 'author_id' });
    } else if (tab === 'issues') {
      issues = await apex.collection('issues').list({ sort: '-created', page: 1, per_page: 50, expand: 'author_id' });
    } else if (tab === 'tenancy') {
      tenancy = await apex.collection('tenancy_offers').list({ sort: '-created', page: 1, per_page: 50, expand: 'provider_id' });
    } else {
      starters = await apex.collection('starters').list({ sort: '-created', page, per_page: perPage });
    }
  } catch (e) {
    console.error("Ecosystem fetch failed", e);
  }

  return { showcase, starters, sharedCode, discussions, issues, tenancy };
}

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function EcosystemPage({ searchParams }: PageProps) {
  // Parse Query Params
  const activeTab = (searchParams.tab as string) || 'starters';
  const page = Number(searchParams.page) || 1;
  const perPage = 12; // Grid of 3 columns x 4 rows

  // Fetch Data
  const { showcase, starters, sharedCode, discussions, issues, tenancy } = await getData(activeTab, page, perPage);

  // Determine active pagination data based on tab
  let totalItems = 0;
  if (activeTab === 'showcase') totalItems = showcase.total;
  else if (activeTab === 'code') totalItems = sharedCode.total;
  else if (activeTab === 'starters') totalItems = starters.total;
  
  const totalPages = Math.ceil(totalItems / perPage);

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">Ecosystem Hub</h1>
        <p className="text-muted max-w-2xl">
            Explore community-built starters, share code snippets, report issues, or join the conversation.
        </p>
      </div>

      <EcosystemView
        initialTab={activeTab}
        showcaseData={showcase}
        startersData={starters}
        sharedData={sharedCode}
        discussionsData={discussions.items}
        issuesData={issues.items}
        tenancyData={tenancy.items}
        currentPage={page}
        totalPages={totalPages}
      />
    </div>
  );
}