import { apex } from '@/lib/apexkit';
import { RoadmapView } from '@/components/Roadmap/RoadmapView';
import { Map } from 'lucide-react';

async function getRoadmapData() {
  try {
    const res = await apex.collection('roadmap').list({ sort: 'quarter' });
    const items = res.items;

    // Group by Quarter
    const groups: Record<string, any[]> = {};
    items.forEach((item: any) => {
        const q = item.data.quarter || 'Future';
        if (!groups[q]) groups[q] = [];
        groups[q].push(item);
    });
    
    // Sort Quarters
    const sortedQuarters = Object.keys(groups).sort((a, b) => {
        if (a === 'Future') return 1;
        if (b === 'Future') return -1;
        
        const [qA, yA] = a.split(' '); // ["Q1", "2026"]
        const [qB, yB] = b.split(' ');

        if (yA !== yB) return (yA || '').localeCompare(yB || '');
        return (qA || '').localeCompare(qB || '');
    });

    return { groups, sortedQuarters };
  } catch (e) {
      console.error("Roadmap fetch failed", e);
      return { groups: {}, sortedQuarters: [] };
  }
}

export const revalidate = 60;

export default async function RoadmapPage() {
  const { groups, sortedQuarters } = await getRoadmapData();

  return (
    <div className="p-6 md:p-12 max-w-[1400px] mx-auto min-h-screen">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold tracking-wide uppercase">
                    <Map size={14} /> Product Vision
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">Road Ahead</h1>
                <p className="text-muted text-lg max-w-2xl leading-relaxed">
                    Our transparent development timeline. We prioritize features based on community feedback and architectural stability.
                </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted bg-surface/50 border border-border px-4 py-2 rounded-full">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span>Live Sync from DB</span>
            </div>
        </div>

        <RoadmapView groups={groups} sortedQuarters={sortedQuarters} />
        
        <div className="mt-24 p-8 bg-surface/30 border border-border rounded-3xl text-center max-w-3xl mx-auto">
            <p className="text-muted text-sm mb-6">
                Roadmap items are prioritized based on technical dependencies and community votes on the Issues board.
            </p>
            <div className="flex flex-wrap justify-center gap-8">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-widest">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span> Done
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-widest">
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]"></span> In Progress
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-widest">
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-600"></span> Planned
                </div>
            </div>
        </div>
    </div>
  );
}