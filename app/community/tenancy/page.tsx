import { apex } from '@/lib/apexkit';
import { TenancyList } from '@/components/Community/TenancyList';

async function getOffers() {
    try {
        const res = await apex.collection('tenancy_offers').list({ 
            sort: '-created', 
            expand: 'provider_id' 
        });
        return res.items;
    } catch { return []; }
}

// Opt-in the entire application to the Edge Runtime (required for Cloudflare Pages)
export const runtime = 'edge';
export const revalidate = 0;

export default async function TenancyPage() {
    const items = await getOffers();
    return <TenancyList initialItems={items} />;
} 