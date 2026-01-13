// app/page.tsx
import { apex } from '@/lib/apexkit';
import { HeroSection } from '@/components/Home/HeroSection';
import { FeatureGrid } from '@/components/Home/FeatureGrid';
import { NewsSection } from '@/components/Home/NewsSection';

// Data Fetching Function (Server Side)
async function getHomeData() {
  try {
    const [heroRes, whyRes, useRes, newsRes] = await Promise.all([
        apex.collection('hub_content').list({ filter: JSON.stringify({ slug: "home-hero" }) }),
        apex.collection('why_apexkit').list({ sort: 'order' }),
        apex.collection('use_cases').list({ sort: 'order' }),
        apex.collection('news').list({ sort: '-date', per_page: 2 })
    ]);

    return {
        hero: heroRes.items[0]?.data || null,
        features: whyRes.items,
        useCases: useRes.items,
        news: newsRes.items
    };
  } catch (e) {
      console.error("Home data fetch failed", e);
      return { hero: null, features: [], useCases: [], news: [] };
  }
}

export const revalidate = 60; // ISR: Revalidate every 60 seconds

export default async function HomePage() {
  const { hero, features, useCases, news } = await getHomeData();

  return (
    <div className="p-6 md:p-12 space-y-24">
      <HeroSection data={hero} />
      <FeatureGrid features={features} />
      {/* Pass useCases to a component */}
      <NewsSection news={news} />
    </div>
  );
}