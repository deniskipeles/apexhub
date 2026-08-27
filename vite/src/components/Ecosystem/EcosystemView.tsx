import React, { useState, useEffect } from 'react';
import { apex, getFileUrl } from '@/lib/apexkit';
import { 
    Package, Layout, Terminal, Star, Download, Eye,
    Search, Plus, Layers, Loader2, X, MessageCircle, Bug, Server, Sparkles, ExternalLink 
} from 'lucide-react';
import { useRouter, useSearchParams } from '@/lib/navigation';
import { ThreadList } from '../Community/ThreadList';
import { TenancyList } from '../Community/TenancyList';
import { FileExplorerModal } from './FileExplorerModal';

interface EcosystemViewProps {
  defaultTab?: string;
}

export function EcosystemView({ defaultTab = 'marketplace' }: EcosystemViewProps = {}) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const activeTab = searchParams.get('tab') || defaultTab;
    const [search, setSearch] = useState("");
    
    // Unified Data States
    const [ecosystemItems, setEcosystemItems] = useState<any[]>([]);
    const [communityThreads, setCommunityThreads] = useState<any[]>([]);
    const [tenancyOffers, setTenancyOffers] = useState<any[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [previewItem, setPreviewItem] = useState<any | null>(null);

    // Upload Modal States
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState({ title: '', desc: '', type: 'script', url: '', tagsInput: '' });
    const [file, setFile] = useState<File | null>(null);

    const fetchEcosystemData = async () => {
        setLoading(true);
        try {
            if (['marketplace', 'starters', 'scripts', 'modules', 'showcase'].includes(activeTab)) {
                const res = await apex.webhook('api-community').get('/ecosystem/items', { tab: activeTab });
                if (res.success) setEcosystemItems(res.items);
            } else if (['discussions', 'issues'].includes(activeTab)) {
                const typeFilter = activeTab === 'issues' ? 'issue' : 'discussion';
                const res = await apex.webhook('api-community').get('/ecosystem/threads', { type: typeFilter });
                if (res.success) setCommunityThreads(res.items);
            } else if (activeTab === 'tenancy') {
                const res = await apex.webhook('api-community').get('/ecosystem/tenancy');
                if (res.success) setTenancyOffers(res.items);
            }
        } catch (err) {
            console.error("Failed to load ecosystem data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEcosystemData();
    }, [activeTab]);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);
        try {
            let filename = null;
            if (file) {
                const uploadedFile = await apex.files.upload(file);
                filename = uploadedFile.filename;
            }

            const tags = formData.tagsInput ? formData.tagsInput.split(',').map(t => t.trim()).filter(Boolean) : [];

            await apex.webhook('api-community').post('/ecosystem/items', {
                title: formData.title,
                type: formData.type,
                description: formData.desc,
                url: formData.url || null,
                file: filename,
                tags
            });

            setIsUploadOpen(false);
            setFormData({ title: '', desc: '', type: 'script', url: '', tagsInput: '' });
            setFile(null);
            await fetchEcosystemData();
        } catch (err: any) {
            alert(err.message || "Upload failed. Make sure you are signed in and have a Profile.");
        } finally {
            setIsUploading(false);
        }
    };

    const getFilteredItems = () => {
        if (!search.trim()) return ecosystemItems;
        return ecosystemItems.filter(i => 
            i.title?.toLowerCase().includes(search.toLowerCase()) ||
            i.description?.toLowerCase().includes(search.toLowerCase())
        );
    };

    const isItemTab = ['marketplace', 'starters', 'scripts', 'modules', 'showcase'].includes(activeTab);

    return (
        <div className="p-6 md:p-12 max-w-7xl mx-auto min-h-screen">
            <div className="text-center mb-10 max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase mb-6 shadow-sm">
                    <Sparkles size={14} className="text-amber-500" /> Community Ecosystem
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
                    Plugins, Starters & Community
                </h1>
            </div>

            <div className="flex justify-center mb-10 overflow-x-auto pb-2">
                <div className="bg-surface/80 p-1.5 rounded-2xl border border-border inline-flex gap-1.5 shadow-sm max-w-full overflow-x-auto no-scrollbar">
                    <TabBtn active={activeTab === 'marketplace'} onClick={() => router.replace('/ecosystem?tab=marketplace')} icon={<Package size={16} />} label="All Items" />
                    <TabBtn active={activeTab === 'starters'} onClick={() => router.replace('/ecosystem?tab=starters')} icon={<Layout size={16} />} label="Starters" />
                    <TabBtn active={activeTab === 'scripts'} onClick={() => router.replace('/ecosystem?tab=scripts')} icon={<Terminal size={16} />} label="Webhooks" />
                    <TabBtn active={activeTab === 'modules'} onClick={() => router.replace('/ecosystem?tab=modules')} icon={<Layers size={16} />} label="Modules" />
                    <TabBtn active={activeTab === 'showcase'} onClick={() => router.replace('/ecosystem?tab=showcase')} icon={<Star size={16} />} label="Showcase" />
                    <div className="w-px h-6 bg-border my-auto mx-1"></div>
                    <TabBtn active={activeTab === 'discussions'} onClick={() => router.replace('/ecosystem?tab=discussions')} icon={<MessageCircle size={16} />} label="Discussions" />
                    <TabBtn active={activeTab === 'issues'} onClick={() => router.replace('/ecosystem?tab=issues')} icon={<Bug size={16} />} label="Issues" />
                    <TabBtn active={activeTab === 'tenancy'} onClick={() => router.replace('/ecosystem?tab=tenancy')} icon={<Server size={16} />} label="Tenancy Market" />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>
            ) : (
                <>
                    {isItemTab && (
                        <div>
                            <div className="flex flex-col sm:flex-row gap-4 justify-between mb-8">
                                <div className="relative flex-1 sm:max-w-md">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={16} />
                                    <input 
                                        type="text" 
                                        placeholder="Search ecosystem..." 
                                        className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-foreground focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                    />
                                </div>
                                <button onClick={() => setIsUploadOpen(true)} className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-hover flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer">
                                    <Plus size={16} /> Submit Item
                                </button>
                            </div>

                            {getFilteredItems().length === 0 ? (
                                <div className="text-center py-20 bg-surface/30 border border-border rounded-2xl p-8">
                                    <Package className="mx-auto text-muted mb-3 h-10 w-10 opacity-50" />
                                    <h3 className="text-lg font-bold text-foreground mb-1">No ecosystem items in database</h3>
                                    <p className="text-sm text-muted mb-4">Be the first to publish an asset to the ApexKit database.</p>
                                    <button onClick={() => setIsUploadOpen(true)} className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-md cursor-pointer">
                                        Submit First Item
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {getFilteredItems().map(item => (
                                        <div key={item.id} className="bg-surface border border-border rounded-2xl p-6 hover:border-primary/50 transition-all flex flex-col justify-between group relative overflow-hidden">
                                            <div>
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                                                        item.type === 'script' ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30' :
                                                        item.type === 'site' || item.type === 'starter' ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30' :
                                                        item.type === 'module' || item.type === 'i_action' ? 'bg-purple-500/15 text-purple-500 border border-purple-500/30' :
                                                        'bg-cyan-500/15 text-cyan-500 border border-cyan-500/30'
                                                    }`}>
                                                        {item.type === 'i_action' ? 'ai_action' : item.type}
                                                    </span>
                                                    <span className="text-xs text-muted font-mono">{new Date(item.created).toLocaleDateString()}</span>
                                                </div>
                                                <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                                                <p className="text-sm text-muted line-clamp-3 mb-4">{item.description}</p>
                                                {item.installCommand && (
                                                    <div className="bg-background border border-border p-2.5 rounded-xl font-mono text-xs text-emerald-400 mb-4 truncate flex items-center gap-2">
                                                        <Terminal size={12} className="shrink-0 text-muted" />
                                                        <span className="truncate">{item.installCommand}</span>
                                                    </div>
                                                )}
                                                {item.tags && item.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 mb-6">
                                                        {item.tags.map((tag: string, idx: number) => (
                                                            <span key={idx} className="px-2 py-0.5 rounded bg-foreground/5 text-muted text-[10px] font-medium border border-border">
                                                                #{tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-2 border-t border-border/60 pt-4 mt-auto">
                                                {item.file ? (
                                                    <>
                                                        <button 
                                                            onClick={() => setPreviewItem(item.raw)}
                                                            className="flex-1 py-2 bg-background hover:bg-primary/10 border border-border hover:border-primary/30 text-foreground hover:text-primary font-semibold rounded-lg text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                                                        >
                                                            <Eye size={14} /> Inspect
                                                        </button>
                                                        <a 
                                                            href={getFileUrl(item.file)} 
                                                            download 
                                                            className="p-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors flex items-center justify-center"
                                                        >
                                                            <Download size={16} />
                                                        </a>
                                                    </>
                                                ) : item.url ? (
                                                    <a 
                                                        href={item.url} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        className="flex-1 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-semibold rounded-lg text-xs flex items-center justify-center gap-2 transition-colors"
                                                    >
                                                        <ExternalLink size={14} /> Visit Link
                                                    </a>
                                                ) : null}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {['discussions', 'issues'].includes(activeTab) && (
                        <ThreadList initialItems={communityThreads} threadType={activeTab === 'issues' ? 'issue' : 'discussion'} />
                    )}
                    {activeTab === 'tenancy' && <TenancyList initialItems={tenancyOffers} />}
                </>
            )}

            {previewItem && <FileExplorerModal item={previewItem} onClose={() => setPreviewItem(null)} />}

            {isUploadOpen && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-surface border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl relative animate-in zoom-in-95">
                        <button type="button" onClick={() => setIsUploadOpen(false)} className="absolute top-4 right-4 text-muted hover:text-foreground cursor-pointer"><X size={20} /></button>
                        <h2 className="text-xl font-bold mb-6 text-foreground flex items-center gap-2">
                            <Plus className="text-primary" size={20} /> Submit Ecosystem Asset
                        </h2>
                        
                        <form onSubmit={handleUpload} className="space-y-4">
                            <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none" placeholder="Asset Title" />
                            <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none">
                                <option value="script">Webhook Script (.js)</option>
                                <option value="starter">Starter Template (.zip)</option>
                                <option value="module">Custom Module</option>
                                <option value="showcase">Showcase Link</option>
                            </select>
                            <textarea required rows={3} value={formData.desc} onChange={e => setFormData({ ...formData, desc: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none resize-none" placeholder="Description..." />
                            
                            {formData.type === 'showcase' ? (
                                <input required value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none" placeholder="https://..." />
                            ) : (
                                <input type="file" required onChange={e => setFile(e.target.files?.[0] || null)} className="w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-primary/10 file:text-primary cursor-pointer" />
                            )}
                            
                            <button type="submit" disabled={isUploading} className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer">
                                {isUploading ? <Loader2 className="animate-spin" size={18} /> : 'Upload Asset'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function TabBtn({ active, onClick, icon, label }: any) {
    return (
        <button onClick={onClick} className={`px-4 py-2 rounded-xl font-bold text-xs md:text-sm flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${active ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-muted hover:text-foreground hover:bg-foreground/5'}`}>
            {icon} {label}
        </button>
    );
}