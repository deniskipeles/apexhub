import React, { useEffect, useState } from 'react';
import { apex } from '@/lib/apexkit';
import { HeroSection } from './HeroSection';
import { FeatureGrid } from './FeatureGrid';
import { NewsSection } from './NewsSection';
import { Loader2 } from 'lucide-react';

export function HomeView() {
  const [data, setData] = useState<{
    hero: any;
    features: any[];
    useCases: any[];
    news: any[];
  }>({
    hero: null,
    features: [],
    useCases: [],
    news: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [heroRes, whyRes, useRes, newsRes] = await Promise.all([
          apex.collection('hub_content').list({ filter: JSON.stringify({ slug: "home-hero" }) }).catch(() => ({ items: [] })),
          apex.collection('why_apexkit').list({ sort: 'order' }).catch(() => ({ items: [] })),
          apex.collection('use_cases').list({ sort: 'order' }).catch(() => ({ items: [] })),
          apex.collection('news').list({ sort: '-date', per_page: 2 }).catch(() => ({ items: [] }))
        ]);

        setData({
          hero: heroRes.items[0]?.data || null,
          features: whyRes.items || [],
          useCases: useRes.items || [],
          news: newsRes.items || []
        });
      } catch (e) {
        console.error("Home data fetch failed", e);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="animate-spin text-muted h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 space-y-24">
      <HeroSection data={data.hero} />
      <FeatureGrid features={data.features} />
      <NewsSection news={data.news} />
    </div>
  );
}
