import React, { useEffect, useState } from 'react';
import { CheckCircle2, Circle, Clock, ChevronRight, Map, Loader2 } from 'lucide-react';
import { apex } from '@/lib/apexkit';

export function RoadmapView() {
    const [groups, setGroups] = useState<Record<string, any[]>>({});
    const [sortedQuarters, setSortedQuarters] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apex.collection('roadmap').list({ sort: 'quarter' })
            .then((res: any) => {
                const items = res.items || [];
                const grps: Record<string, any[]> = {};
                items.forEach((item: any) => {
                    const q = item.data?.quarter || 'Future';
                    if (!grps[q]) grps[q] = [];
                    grps[q].push(item);
                });

                const sorted = Object.keys(grps).sort((a, b) => {
                    if (a === 'Future') return 1;
                    if (b === 'Future') return -1;
                    const [qA, yA] = a.split(' ');
                    const [qB, yB] = b.split(' ');
                    if (yA !== yB) return (yA || '').localeCompare(yB || '');
                    return (qA || '').localeCompare(qB || '');
                });

                setGroups(grps);
                setSortedQuarters(sorted);
            })
            .catch(() => {
                setGroups({});
                setSortedQuarters([]);
            })
            .finally(() => setLoading(false));
    }, []);

    const getStatusColor = (status?: string) => {
        switch(status) {
            case 'done': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'in-progress': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            default: return 'bg-surface/50 text-muted border-border';
        }
    };

    const getStatusLabel = (status?: string) => {
         switch(status) {
            case 'done': return 'Done';
            case 'in-progress': return 'In Progress';
            default: return 'Planned';
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-[50vh]"><Loader2 className="animate-spin text-muted h-8 w-8" /></div>;
    }

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

            {sortedQuarters.length === 0 ? (
                <div className="text-center py-20 bg-surface/20 border border-dashed border-border rounded-3xl">
                    <Map size={48} className="mx-auto text-muted/30 mb-4" />
                    <h3 className="text-lg font-bold text-foreground">No roadmap items found</h3>
                    <p className="text-muted">Check back later for updates.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 items-start">
                    {sortedQuarters.map((quarter) => (
                        <div key={quarter} className="flex flex-col gap-5 min-w-0 h-full">
                            <div className="flex items-center justify-between pb-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10 pt-2">
                                <h3 className="font-bold text-xl text-foreground flex items-center gap-2">
                                    {quarter}
                                    <ChevronRight size={16} className="text-muted" />
                                </h3>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted bg-surface border border-border px-2 py-1 rounded">
                                    {groups[quarter]?.length || 0} Items
                                </span>
                            </div>
                            
                            <div className="flex flex-col gap-4">
                                {groups[quarter]?.map((item: any) => (
                                    <div 
                                        key={item.id} 
                                        className="bg-surface/40 border border-border rounded-2xl p-6 hover:border-primary/40 transition-all group hover:shadow-xl hover:shadow-primary/5 flex flex-col h-full ring-1 ring-transparent hover:ring-primary/10 relative overflow-hidden"
                                    >
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border mb-4 w-fit shadow-sm ${getStatusColor(item.data?.status)}`}>
                                            {item.data?.status === 'in-progress' && <Clock size={12} className="animate-spin-slow" />}
                                            {item.data?.status === 'done' && <CheckCircle2 size={12} />}
                                            {item.data?.status === 'planned' && <Circle size={12} />}
                                            {getStatusLabel(item.data?.status)}
                                        </div>
                                        
                                        <h4 className="text-foreground text-lg font-bold mb-3 group-hover:text-primary transition-colors leading-snug">
                                            {item.data?.headline}
                                        </h4>
                                        <p className="text-sm text-muted leading-relaxed mb-6 flex-grow font-medium line-clamp-4">
                                            {item.data?.description}
                                        </p>
                                        
                                        {item.data?.status === 'in-progress' && (
                                            <div className="space-y-2 mt-auto">
                                                <div className="flex justify-between text-[10px] font-bold uppercase text-accent/80 tracking-tighter">
                                                    <span>Completion</span>
                                                    <span>{item.data.progress || 50}%</span>
                                                </div>
                                                <div className="w-full bg-background/50 h-1.5 rounded-full overflow-hidden border border-border/50">
                                                    <div 
                                                        className="bg-accent h-full shadow-[0_0_8px_rgba(234,179,8,0.3)]" 
                                                        style={{ width: `${item.data.progress || 50}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}

                                        {item.data?.status === 'done' && (
                                            <div className="mt-auto pt-4 border-t border-border/30 flex items-center justify-between text-[10px] font-bold text-muted uppercase tracking-widest">
                                                <span>Released</span>
                                                <CheckCircle2 size={16} className="text-green-500" />
                                            </div>
                                        )}
                                        
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

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
