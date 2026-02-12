'use client';

import React, { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { 
    Layers, Box, Terminal, Copy, ExternalLink, 
    Plus, Brain, Database, FileCode, Layout, Globe, 
    User, Download, Eye, ArrowRight
} from 'lucide-react';
import { apex, getFileUrl } from '@/lib/apexkit';
import Link from 'next/link';
import { FileExplorerModal } from './FileExplorerModal';
import { Pagination } from '../ui/Pagination'; // Ensure this path is correct

interface ListData {
    items: any[];
    total: number;
}

interface Props {
    initialTab: string;
    showcaseData: ListData;
    startersData: ListData;
    sharedData: ListData;
    currentPage: number;
    totalPages: number;
}

const TYPE_ICONS: Record<string, any> = {
    script: FileCode,
    ai_action: Brain,
    schema: Database,
    template: Layout,
    site: Globe
};

const TYPE_COLORS: Record<string, string> = {
    script: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
    ai_action: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    schema: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    template: "text-pink-500 bg-pink-500/10 border-pink-500/20",
    site: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
};

export function EcosystemView({ 
    initialTab, 
    showcaseData, 
    startersData, 
    sharedData,
    currentPage,
    totalPages 
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // State
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [inspectingItem, setInspectingItem] = useState<any | null>(null);

  // Sync URL on tab change (Reset page to 1)
  const handleTabChange = (tab: string) => {
      setActiveTab(tab);
      const params = new URLSearchParams(searchParams);
      params.set('tab', tab);
      params.delete('page'); // Reset pagination on tab switch
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Helper to generate pagination base path
  const paginationBasePath = `${pathname}?tab=${activeTab}`;

  return (
    <div className="space-y-8">
        {/* --- HEADER & NAV --- */}
        <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-border pb-1">
                <nav className="flex gap-6 -mb-px overflow-x-auto w-full md:w-auto no-scrollbar">
                    <TabButton active={activeTab === 'starters'} onClick={() => handleTabChange('starters')} label="Starters" icon={<Terminal size={16}/>} />
                    <TabButton active={activeTab === 'community'} onClick={() => handleTabChange('community')} label="Community" icon={<Database size={16}/>} />
                    <TabButton active={activeTab === 'showcase'} onClick={() => handleTabChange('showcase')} label="Showcase" icon={<Layers size={16}/>} />
                </nav>
                
                {/* Only show "Share" on community tab to reduce clutter, or keep globally */}
                {activeTab === 'community' && (
                    <Link href="/ecosystem/new" className="hidden md:flex px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-hover items-center gap-2 shadow-sm transition-all mb-2">
                        <Plus size={16} /> Share Code
                    </Link>
                )}
            </div>
        </div>

        {/* --- COMMUNITY CODE TAB --- */}
        {activeTab === 'community' && (
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
                    {sharedData.items.map((item: any) => {
                        const Icon = TYPE_ICONS[item.data.type] || Box;
                        const colorClass = TYPE_COLORS[item.data.type] || "";
                        const author = item.expand?.author_id?.email?.split('@')[0] || 'User';

                        return (
                            <div key={item.id} className="bg-surface/30 border border-border rounded-xl p-5 hover:border-primary/40 transition-all flex flex-col group relative overflow-hidden h-full">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-2.5 rounded-lg border ${colorClass} bg-opacity-20`}>
                                        <Icon size={20} />
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${colorClass} bg-transparent`}>
                                        {item.data.type.replace('_', ' ')}
                                    </span>
                                </div>

                                <div className="flex-1">
                                    <h3 className="font-bold text-foreground text-lg mb-1 line-clamp-1" title={item.data.title}>{item.data.title}</h3>
                                    <div className="flex items-center gap-1.5 text-xs text-muted mb-4">
                                        <User size={12} /> <span className="font-medium">{author}</span>
                                    </div>
                                    <p className="text-sm text-muted leading-relaxed line-clamp-3 mb-4">
                                        {item.data.description}
                                    </p>
                                </div>
                                
                                <div className="flex flex-wrap gap-1.5 mb-6">
                                    {item.data.tags?.slice(0, 3).map((tag: string) => (
                                        <span key={tag} className="text-[10px] bg-surface border border-border px-2 py-0.5 rounded text-muted font-medium">#{tag}</span>
                                    ))}
                                </div>

                                <div className="mt-auto grid grid-cols-2 gap-2">
                                    <button 
                                        onClick={() => setInspectingItem(item)}
                                        className="py-2 bg-surface hover:bg-surface/80 border border-border text-foreground font-medium rounded-lg text-xs flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <Eye size={14} /> Peek Code
                                    </button>
                                    <a 
                                        href={getFileUrl(item.data.file)} 
                                        download 
                                        className="py-2 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <Download size={14} /> Download
                                    </a>
                                </div>
                            </div>
                        );
                    })}
                    {sharedData.items.length === 0 && (
                        <div className="col-span-full py-20 text-center text-muted border-2 border-dashed border-border rounded-xl">
                            No community items shared yet.
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* --- STARTERS TAB --- */}
        {activeTab === 'starters' && (
             <div className="space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
                    {startersData.items.map((kit: any) => (
                        <div key={kit.id} className="bg-surface/30 border border-border rounded-xl p-6 flex flex-col group hover:shadow-lg transition-all">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-10 h-10 bg-background rounded-lg border border-border flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <Terminal size={20} />
                                </div>
                                {kit.data.repo_url && (
                                    <Link href={kit.data.repo_url} target="_blank" className="text-muted hover:text-foreground">
                                        <ExternalLink size={18} />
                                    </Link>
                                )}
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-2">{kit.data.framework}</h3>
                            <p className="text-sm text-muted mb-6 leading-relaxed flex-1">{kit.data.description}</p>
                            <div className="mt-auto bg-black/30 rounded-lg p-3 border border-white/5 font-mono text-[11px] text-zinc-300 flex justify-between items-center group/code relative">
                                <code className="truncate mr-2">{kit.data.install_command}</code>
                                <button 
                                    onClick={() => navigator.clipboard.writeText(kit.data.install_command)} 
                                    className="text-muted hover:text-white p-1 rounded hover:bg-white/10"
                                    title="Copy Command"
                                >
                                    <Copy size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                 </div>
             </div>
        )}

        {/* --- SHOWCASE TAB --- */}
        {activeTab === 'showcase' && (
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                     {showcaseData.items.map((proj: any) => (
                        <div key={proj.id} className="group bg-surface/30 border border-border rounded-2xl overflow-hidden hover:border-primary/40 transition-all flex flex-col sm:flex-row h-full shadow-sm hover:shadow-md">
                            <div className="w-full sm:w-48 h-48 bg-black/5 relative overflow-hidden shrink-0 border-b sm:border-b-0 sm:border-r border-border">
                                {proj.data.thumbnail ? (
                                    <img src={getFileUrl(proj.data.thumbnail)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted/20"><Globe size={48} /></div>
                                )}
                            </div>
                            <div className="p-6 flex flex-col justify-center min-w-0 flex-1">
                                <h3 className="text-xl font-bold text-foreground mb-2 truncate">{proj.data.title}</h3>
                                <p className="text-sm text-muted line-clamp-2 mb-4 leading-relaxed">{proj.data.description}</p>
                                <Link href={proj.data.url || "#"} target="_blank" className="text-primary text-xs font-bold flex items-center gap-1 hover:underline mt-auto">
                                    View Live <ArrowRight size={12} />
                                </Link>
                            </div>
                        </div>
                     ))}
                </div>
            </div>
        )}

        {/* --- PAGINATION --- */}
        <div className="flex justify-center pt-8 border-t border-border">
            <Pagination 
                totalPages={totalPages} 
                currentPage={currentPage} 
                basePath={paginationBasePath} 
            />
        </div>

        {/* --- FILE INSPECTION MODAL --- */}
        {inspectingItem && (
            <FileExplorerModal 
                item={inspectingItem} 
                onClose={() => setInspectingItem(null)} 
            />
        )}
    </div>
  );
}

function TabButton({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon: React.ReactNode }) {
    return (
        <button 
            onClick={onClick}
            className={`pb-3 text-sm font-medium transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                active 
                ? 'border-primary text-foreground' 
                : 'border-transparent text-muted hover:text-foreground hover:border-border'
            }`}
        >
            {icon} {label}
        </button>
    );
}