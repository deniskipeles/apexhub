'use client';

import React, { useEffect, useState } from 'react';
import { GitCommit, Calendar, Tag, ArrowRight } from 'lucide-react';
import { renderMarkdown } from '@/lib/commonHelpers';

interface Props {
    releases: any[];
}

export function ChangelogView({ releases }: Props) {
    const [renderedContent, setRenderedContent] = useState<Record<string, string>>({});

    useEffect(() => {
        // Pre-render markdown on client mount
        const renderAll = async () => {
            const htmlMap: Record<string, string> = {};
            for (const item of releases) {
                htmlMap[item.id] = await renderMarkdown(item.data.body || '');
            }
            setRenderedContent(htmlMap);
        };
        renderAll();
    }, [releases]);

    return (
        <div className="p-6 md:p-12 max-w-4xl mx-auto min-h-screen">
            <div className="mb-16">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary border border-primary/20 shadow-sm">
                        <GitCommit size={28} />
                    </div>
                    <h1 className="text-4xl font-bold text-foreground tracking-tight">Changelog</h1>
                </div>
                <p className="text-xl text-muted leading-relaxed">
                    Stay updated with the latest improvements, fixes, and features shipping to ApexKit.
                </p>
            </div>

            {releases.length === 0 ? (
                <div className="text-center py-20 bg-surface/20 border border-dashed border-border rounded-3xl">
                    <Tag size={48} className="mx-auto text-muted/30 mb-4" />
                    <h3 className="text-lg font-bold text-foreground">No releases found</h3>
                    <p className="text-muted">The changelog is empty.</p>
                </div>
            ) : (
                <div className="relative border-l-2 border-border ml-3 md:ml-6 space-y-16 pb-12">
                    {releases.map((release, index) => {
                        const d = release.data;
                        const isLatest = index === 0;

                        return (
                            <div key={release.id} className="relative pl-8 md:pl-12 group">
                                {/* Timeline Dot */}
                                <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-4 border-background transition-colors duration-300 ${isLatest ? 'bg-primary ring-4 ring-primary/20' : 'bg-border group-hover:bg-muted'}`}></div>
                                
                                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-3xl font-bold text-foreground font-mono tracking-tight">
                                            {d.version}
                                        </h2>
                                        {isLatest && (
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded-md border border-primary/20 shadow-sm flex items-center gap-1">
                                                Latest <ArrowRight size={10} />
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted font-medium bg-surface px-3 py-1 rounded-full border border-border w-fit">
                                        <Calendar size={14} />
                                        {new Date(d.release_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </div>
                                </div>

                                <div className="bg-surface/40 border border-border rounded-2xl p-6 md:p-8 hover:bg-surface/60 hover:border-primary/20 transition-all shadow-sm group-hover:shadow-md">
                                     <div 
                                        className="prose prose-zinc dark:prose-invert max-w-none"
                                        dangerouslySetInnerHTML={{ __html: renderedContent[release.id] || '' }}
                                     />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            
            <div className="mt-16 text-center pt-12 border-t border-border">
                <p className="text-muted text-sm">
                    Want to contribute? Check out our <a href="#" className="text-primary hover:underline font-medium">GitHub Repository</a>.
                </p>
            </div>
        </div>
    );
}