'use client';

import React, { useState } from 'react';
import { Layers, Box, Terminal, Copy, Check, ExternalLink, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { getFileUrl } from '@/lib/apexkit';
import Link from 'next/link';

interface Props {
    initialShowcase: any[];
    initialStarters: any[];
}

export function EcosystemView({ initialShowcase, initialStarters }: Props) {
  const [activeTab, setActiveTab] = useState<'showcase' | 'starters'>('starters');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const copyCommand = (id: string, cmd: string) => {
      navigator.clipboard.writeText(cmd);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
  };

  const activeList = activeTab === 'starters' ? initialStarters : initialShowcase;
  const totalPages = Math.ceil(activeList.length / itemsPerPage) || 1;
  const currentItems = activeList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleTabChange = (tab: 'showcase' | 'starters') => {
      setActiveTab(tab);
      setCurrentPage(1);
  };

  return (
    <div>
        {/* Tabs */}
        <div className="flex gap-2 border-b border-border mb-8">
            <button 
                onClick={() => handleTabChange('starters')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'starters' ? 'border-primary text-foreground' : 'border-transparent text-muted hover:text-foreground'}`}
            >
                <Terminal size={16} /> Starter Kits
            </button>
            <button 
                onClick={() => handleTabChange('showcase')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'showcase' ? 'border-primary text-foreground' : 'border-transparent text-muted hover:text-foreground'}`}
            >
                <Layers size={16} /> Showcase
            </button>
        </div>

        {/* Content Grid */}
        <div className="min-h-[400px]">
            {/* STARTERS TAB */}
            {activeTab === 'starters' && (
                <>
                    {initialStarters.length === 0 ? (
                        <div className="text-center py-20 text-muted">No starter kits found.</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
                            {currentItems.map((kit: any) => {
                                const d = kit.data;
                                const iconUrl = d.icon ? getFileUrl(d.icon) : null;
                                
                                return (
                                    <div key={kit.id} className="bg-surface border border-border rounded-xl p-6 hover:border-primary/40 transition-colors flex flex-col">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center border border-border overflow-hidden">
                                                    {iconUrl ? (
                                                        <img src={iconUrl} alt="" className="w-6 h-6 object-contain" />
                                                    ) : (
                                                        <Box size={20} className="text-muted" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-foreground">{d.framework}</h3>
                                                    <span className="text-[10px] text-primary font-mono bg-primary/10 px-2 py-0.5 rounded border border-primary/20">Template</span>
                                                </div>
                                            </div>
                                            {d.repo_url && (
                                                <Link href={d.repo_url} target="_blank" className="text-muted hover:text-foreground p-1 hover:bg-background rounded">
                                                    <ExternalLink size={18} />
                                                </Link>
                                            )}
                                        </div>
                                        
                                        <p className="text-muted text-sm mb-6 h-10 line-clamp-2">{d.description}</p>
                                        
                                        <div className="mt-auto bg-background rounded-lg p-3 flex items-center justify-between border border-border group/code">
                                            <code className="text-xs font-mono text-muted group-hover/code:text-foreground transition-colors truncate mr-2 select-all">
                                                {d.install_command || `git clone ${d.repo_url}`}
                                            </code>
                                            <button 
                                                onClick={() => copyCommand(kit.id, d.install_command || `git clone ${d.repo_url}`)}
                                                className="text-muted hover:text-foreground transition-colors shrink-0"
                                            >
                                                {copiedId === kit.id ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {/* SHOWCASE TAB */}
            {activeTab === 'showcase' && (
                 <>
                    {initialShowcase.length === 0 ? (
                        <div className="text-center py-20 text-muted">No projects showcased yet.</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
                            {currentItems.map((item: any) => {
                                const d = item.data;
                                const thumbUrl = d.thumbnail ? getFileUrl(d.thumbnail) : null;
                                
                                return (
                                    <div key={item.id} className="group bg-surface border border-border rounded-xl overflow-hidden hover:border-muted transition-colors flex flex-col h-full">
                                        <div className="h-48 bg-muted/10 relative overflow-hidden flex items-center justify-center border-b border-border">
                                            {thumbUrl ? (
                                                <img src={thumbUrl} alt={d.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                                            ) : (
                                                <ImageIcon className="h-12 w-12 text-muted/20" />
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-surface/80 to-transparent opacity-60"></div>
                                        </div>
                                        <div className="p-5 flex flex-col flex-1">
                                            <h3 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
                                                {d.title} 
                                            </h3>
                                            <p className="text-muted text-sm mb-4 line-clamp-3 leading-relaxed">
                                                {d.description}
                                            </p>
                                            
                                            <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
                                                <span className="text-xs text-muted flex items-center gap-1">
                                                    by <span className="font-semibold text-foreground">@{d.author || 'Unknown'}</span>
                                                </span>
                                                {d.url && (
                                                    <Link href={d.url} target="_blank" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                                                        Visit <ExternalLink size={10} />
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                 </>
            )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-12 pt-8 border-t border-border">
                <button 
                    disabled={currentPage === 1}
                    onClick={() => { setCurrentPage(p => p - 1); window.scrollTo({top:0, behavior:'smooth'}); }}
                    className="p-2 border border-border rounded-lg text-muted hover:text-foreground hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft size={20} />
                </button>
                <span className="text-sm font-medium text-muted">
                    Page <span className="text-foreground">{currentPage}</span> of {totalPages}
                </span>
                <button 
                    disabled={currentPage === totalPages}
                    onClick={() => { setCurrentPage(p => p + 1); window.scrollTo({top:0, behavior:'smooth'}); }}
                    className="p-2 border border-border rounded-lg text-muted hover:text-foreground hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        )}
    </div>
  );
}