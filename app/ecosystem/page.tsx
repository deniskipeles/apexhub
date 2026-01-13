// =========================== /app/ecosystem/page.tsx ===========================
import { apex } from '@/lib/apexkit';
import { EcosystemView } from '@/components/Ecosystem/EcosystemView'; // Client Component

// Define types for server response
interface ShowcaseItem { id: string; data: any }
interface StarterItem { id: string; data: any }

async function getEcosystemData() {
  try {
    const [showcaseRes, startersRes] = await Promise.all([
         apex.collection('showcase').list({ sort: '-created', per_page: 50 }),
         apex.collection('starters').list({ sort: '-created', per_page: 50 })
    ]);

    return {
        showcase: showcaseRes.items,
        starters: startersRes.items
    };
  } catch (e) {
      console.error("Ecosystem fetch failed", e);
      return { showcase: [], starters: [] };
  }
}

export const revalidate = 60; // ISR 1 min

export default async function EcosystemPage() {
  const { showcase, starters } = await getEcosystemData();

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto min-h-screen">
        <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">Ecosystem</h1>
            <p className="text-muted">Discover community projects and jumpstart your development.</p>
        </div>

        {/* Client Component handles tabs and filtering */}
        <EcosystemView 
            initialShowcase={showcase} 
            initialStarters={starters} 
        />
    </div>
  );
}