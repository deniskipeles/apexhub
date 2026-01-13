import { getApexServer } from '@/lib/apexkit';
import Link from 'next/link';
import { 
  MessageSquare, Bug, Server, ArrowRight, 
  MessageCircle, Eye, ThumbsUp, MapPin, Cpu 
} from 'lucide-react';

async function getSummaryData() {
  const apex = await getApexServer();
  try {
    const [discussions, issues, offers] = await Promise.all([
         apex.collection('discussions').list({ sort: '-created', per_page: 3 }),
         apex.collection('issues').list({ sort: '-created', per_page: 3 }),
         apex.collection('tenancy_offers').list({ sort: '-created', per_page: 3 })
    ]);

    return {
        discussions: discussions.items,
        issues: issues.items,
        offers: offers.items
    };
  } catch (e) {
      console.error("Community summary fetch failed", e);
      return { discussions: [], issues: [], offers: [] };
  }
}

export const revalidate = 0;

export default async function CommunityHubPage() {
  const { discussions, issues, offers } = await getSummaryData();

  return (
    <div className="space-y-16">
        
        {/* --- Discussions Section --- */}
        <section>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                        <MessageSquare size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">Discussions</h2>
                        <p className="text-sm text-muted">Join the conversation with the community.</p>
                    </div>
                </div>
                <Link href="/community/discussions" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                    View All <ArrowRight size={16} />
                </Link>
            </div>
            
            <div className="grid gap-4">
                {discussions.map((d: any) => (
                    <Link key={d.id} href={`/community/discussions/${d.id}`} className="block">
                        <div className="bg-surface border border-border rounded-xl p-5 hover:border-primary/40 transition-all flex items-center justify-between group">
                            <div>
                                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1">{d.data.title}</h3>
                                <div className="text-xs text-muted flex gap-2">
                                    <span className="capitalize">{d.data.category}</span>
                                    <span>•</span>
                                    <span>{new Date(d.created).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="flex gap-4 text-xs text-muted">
                                <span className="flex items-center gap-1"><MessageCircle size={14} /> {d.data.replies || 0}</span>
                                <span className="flex items-center gap-1"><Eye size={14} /> {d.data.views || 0}</span>
                            </div>
                        </div>
                    </Link>
                ))}
                {discussions.length === 0 && <div className="text-sm text-muted italic">No active discussions.</div>}
            </div>
        </section>

        {/* --- Issues Section --- */}
        <section>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                        <Bug size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">Issues & Features</h2>
                        <p className="text-sm text-muted">Track bugs and vote on new features.</p>
                    </div>
                </div>
                <Link href="/community/issues" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                    View All <ArrowRight size={16} />
                </Link>
            </div>

            <div className="grid gap-4">
                {issues.map((i: any) => (
                    <Link key={i.id} href={`/community/issues/${i.id}`} className="block">
                        <div className="bg-surface border border-border rounded-xl p-5 hover:border-primary/40 transition-all flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col items-center gap-0.5 min-w-[40px] text-muted">
                                    <ThumbsUp size={16} />
                                    <span className="text-xs font-bold">{i.data.upvotes || 0}</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1">{i.data.title}</h3>
                                    <div className="flex gap-2">
                                        <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold tracking-wide ${i.data.type === 'bug' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                                            {i.data.type}
                                        </span>
                                        <span className="text-xs text-muted self-center">#{i.id.substring(0,8)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className={`text-xs px-2 py-1 rounded capitalize font-medium ${i.data.status === 'open' ? 'text-green-500 bg-green-500/10' : 'text-muted bg-surface'}`}>
                                {i.data.status}
                            </div>
                        </div>
                    </Link>
                ))}
                {issues.length === 0 && <div className="text-sm text-muted italic">No issues reported.</div>}
            </div>
        </section>

        {/* --- Tenancy Market Section --- */}
        <section>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                        <Server size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">Tenancy Market</h2>
                        <p className="text-sm text-muted">Find free community-hosted instances.</p>
                    </div>
                </div>
                <Link href="/community/tenancy" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                    View Market <ArrowRight size={16} />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {offers.map((offer: any) => (
                    <div key={offer.id} className="bg-surface border border-border rounded-xl p-5 hover:border-primary/40 transition-all flex flex-col h-full">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-foreground">{offer.data.provider_name}</h3>
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${offer.data.status === 'available' ? 'bg-green-500/20 text-green-500' : 'bg-surface border border-border text-muted'}`}>
                                {offer.data.status}
                            </span>
                        </div>
                        <div className="space-y-1 mb-4 flex-1">
                            <div className="flex items-center gap-2 text-xs text-muted">
                                <MapPin size={12} /> {offer.data.region}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted font-mono">
                                <Cpu size={12} /> {offer.data.specs}
                            </div>
                        </div>
                        <Link 
                            href="/community/tenancy" 
                            className="w-full py-2 bg-background border border-border rounded-lg text-xs font-medium text-center hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-colors"
                        >
                            View Details
                        </Link>
                    </div>
                ))}
                {offers.length === 0 && <div className="col-span-3 text-sm text-muted italic text-center py-8">No active offers.</div>}
            </div>
        </section>

    </div>
  );
}