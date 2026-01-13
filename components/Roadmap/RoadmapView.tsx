'use client';

import React from 'react';
import { CheckCircle2, Circle, Clock, ChevronRight, Map } from 'lucide-react';

interface Props {
    groups: Record<string, any[]>;
    sortedQuarters: string[];
}

export function RoadmapView({ groups, sortedQuarters }: Props) {

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

    if (sortedQuarters.length === 0) {
        return (
            <div className="text-center py-20 bg-surface/20 border border-dashed border-border rounded-3xl">
                <Map size={48} className="mx-auto text-muted/30 mb-4" />
                <h3 className="text-lg font-bold text-foreground">No roadmap items found</h3>
                <p className="text-muted">Check back later for updates.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 items-start">
            {sortedQuarters.map((quarter) => (
                <div key={quarter} className="flex flex-col gap-5 min-w-0 h-full">
                    {/* Column Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10 pt-2">
                        <h3 className="font-bold text-xl text-foreground flex items-center gap-2">
                            {quarter}
                            <ChevronRight size={16} className="text-muted" />
                        </h3>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted bg-surface border border-border px-2 py-1 rounded">
                            {groups[quarter].length} Items
                        </span>
                    </div>
                    
                    {/* Cards Container */}
                    <div className="flex flex-col gap-4">
                        {groups[quarter].map((item: any) => (
                            <div 
                                key={item.id} 
                                className="bg-surface/40 border border-border rounded-2xl p-6 hover:border-primary/40 transition-all group hover:shadow-xl hover:shadow-primary/5 flex flex-col h-full ring-1 ring-transparent hover:ring-primary/10 relative overflow-hidden"
                            >
                                {/* Status Badge */}
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border mb-4 w-fit shadow-sm ${getStatusColor(item.data.status)}`}>
                                    {item.data.status === 'in-progress' && <Clock size={12} className="animate-spin-slow" />}
                                    {item.data.status === 'done' && <CheckCircle2 size={12} />}
                                    {item.data.status === 'planned' && <Circle size={12} />}
                                    {getStatusLabel(item.data.status)}
                                </div>
                                
                                <h4 className="text-foreground text-lg font-bold mb-3 group-hover:text-primary transition-colors leading-snug">
                                    {item.data.headline}
                                </h4>
                                <p className="text-sm text-muted leading-relaxed mb-6 flex-grow font-medium line-clamp-4">
                                    {item.data.description}
                                </p>
                                
                                {/* Progress Bar (Only for In-Progress) */}
                                {item.data.status === 'in-progress' && (
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

                                {/* Done Stamp */}
                                {item.data.status === 'done' && (
                                    <div className="mt-auto pt-4 border-t border-border/30 flex items-center justify-between text-[10px] font-bold text-muted uppercase tracking-widest">
                                        <span>Released</span>
                                        <CheckCircle2 size={16} className="text-green-500" />
                                    </div>
                                )}
                                
                                {/* Hover Effect Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}