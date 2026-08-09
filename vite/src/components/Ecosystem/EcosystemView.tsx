import React, { useState, useEffect } from 'react';
import { apex, getFileUrl } from '@/lib/apexkit';
import { 
    Package, Layout, Terminal, Heart, Eye, Download, 
    Search, Plus, Layers, Loader2, X, MessageCircle, Bug, Server, Sparkles, Star
} from 'lucide-react';
import { useRouter, useSearchParams } from '@/lib/navigation';
import { DiscussionList } from '../Community/DiscussionList';
import { IssueList } from '../Community/IssueList';
import { TenancyList } from '../Community/TenancyList';
import { FileExplorerModal } from './FileExplorerModal';

const DEFAULT_ECOSYSTEM_ITEMS = [
    {
        id: 'starter-saas',
        data: {
            title: 'ApexKit SaaS Starter Template',
            description: 'Full-stack multi-tenant Next.js & React boilerplate pre-configured with ApexKit auth, LibSQL database schema, payment gateways, and role-based access control.',
            type: 'site',
            downloads: 1420,
            likes: 389,
            author: 'ApexKit Core',
            tags: ['Next.js', 'Multi-tenant', 'Auth', 'Stripe'],
            file: 'saas-starter-v3.zip'
        }
    },
    {
        id: 'script-autosync',
        data: {
            title: 'Auto-Sync & Backup Engine',
            description: 'Boa JS script that executes on $db.after_update hooks to replicate local SQLite WAL transactions to remote cloud storage asynchronously.',
            type: 'script',
            downloads: 980,
            likes: 215,
            author: 'DevNinja',
            tags: ['Boa JS', 'WAL', 'Backup', 'Automation'],
            file: 'autosync_wal.js'
        }
    },
    {
        id: 'module-stripe-crypto',
        data: {
            title: 'Stripe & Crypto Webhook Gateway',
            description: 'Native Rust & Boa module for verifying Stripe Webhook signatures and processing Solana/Ethereum payment notifications in real time.',
            type: 'module',
            downloads: 850,
            likes: 194,
            author: 'FintechLabs',
            tags: ['Stripe', 'Crypto', 'Webhooks', 'Rust'],
            file: 'payment_gateway.mod'
        }
    },
    {
        id: 'showcase-zenith-admin',
        data: {
            title: 'Zenith Enterprise Admin Dashboard',
            description: 'Production-ready showcase app built on ApexKit REST APIs featuring real-time telemetry metrics, vector search playground, and tenant manager.',
            type: 'showcase',
            downloads: 2100,
            likes: 530,
            author: 'Apex Community',
            tags: ['Showcase', 'React', 'Telemetry', 'Dashboard'],
            file: 'zenith_showcase.zip'
        }
    },
    {
        id: 'script-ai-agent',
        data: {
            title: 'Gemini RAG Workflow Pipeline',
            description: 'Embedded Boa script for automatic document chunking, vector embedding generation, and contextual Gemini LLM prompt execution.',
            type: 'script',
            downloads: 1650,
            likes: 412,
            author: 'AI-Studio',
            tags: ['Gemini', 'RAG', 'Vector Search', 'AI'],
            file: 'gemini_rag.js'
        }
    },
    {
        id: 'starter-ecommerce',
        data: {
            title: 'Apex E-Commerce Engine',
            description: 'Ultra-fast headless shopfront with instant search, inventory synchronization, shopping cart, and multi-tenant domain routing.',
            type: 'site',
            downloads: 1120,
            likes: 298,
            author: 'EcomHQ',
            tags: ['E-Commerce', 'Tantivy', 'React', 'Cart'],
            file: 'ecom-starter.zip'
        }
    }
];

interface EcosystemViewProps {
  defaultTab?: string;
}

export function EcosystemView({ defaultTab = 'marketplace' }: EcosystemViewProps = {}) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const activeTab = searchParams.get('tab') || defaultTab;
    const [search, setSearch] = useState("");
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [discussions, setDiscussions] = useState<any[]>([]);
    const [issues, setIssues] = useState<any[]>([]);
    const [tenancyOffers, setTenancyOffers] = useState<any[]>([]);

    const [previewItem, setPreviewItem] = useState<any | null>(null);

    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [type, setType] = useState("script");
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        setLoading(true);
        if (['marketplace', 'starters', 'scripts', 'modules', 'showcase'].includes(activeTab)) {
            apex.collection('ecosystem_items').list({ sort: '-created' })
                .then((res: any) => {
                    const fetched = res.items || [];
                    if (fetched.length === 0) {
                        setItems(DEFAULT_ECOSYSTEM_ITEMS);
                    } else {
                        // Merge fetched items with default samples if needed to guarantee rich content
                        const combined = [...fetched];
                        DEFAULT_ECOSYSTEM_ITEMS.forEach(d => {
                            if (!combined.some(i => i.id === d.id)) combined.push(d);
                        });
                        setItems(combined);
                    }
                })
                .catch(() => setItems(DEFAULT_ECOSYSTEM_ITEMS))
                .finally(() => setLoading(false));
        } else if (activeTab === 'discussions') {
            apex.collection('discussions').list({ sort: '-created', expand: 'author_id' })
                .then((res: any) => setDiscussions(res.items || []))
                .catch(() => setDiscussions([]))
                .finally(() => setLoading(false));
        } else if (activeTab === 'issues') {
            apex.collection('issues').list({ sort: '-created', expand: 'author_id' })
                .then((res: any) => setIssues(res.items || []))
                .catch(() => setIssues([]))
                .finally(() => setLoading(false));
        } else if (activeTab === 'tenancy') {
            apex.collection('tenancy_offers').list({ sort: '-created' })
                .then((res: any) => setTenancyOffers(res.items || []))
                .catch(() => setTenancyOffers([]))
                .finally(() => setLoading(false));
        }
    }, [activeTab]);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', desc);
            formData.append('type', type);
            formData.append('downloads', '0');
            formData.append('likes', '0');
            formData.append('file', file);

            const res = await apex.collection('ecosystem_items').create(formData);
            setItems([res, ...items]);
            setIsUploadOpen(false);
            setTitle(""); setDesc(""); setFile(null);
        } catch (err: any) {
            console.error(err);
            alert("Upload failed. Make sure you are logged in.");
        } finally {
            setIsUploading(false);
        }
    };

    const setTab = (t: string) => {
        router.replace(`/ecosystem?tab=${t}`);
    };

    const getFilteredItems = () => {
        let base = items;
        if (activeTab === 'starters') {
            base = items.filter(i => i.data?.type === 'site' || i.data?.type === 'starter');
        } else if (activeTab === 'scripts') {
            base = items.filter(i => i.data?.type === 'script');
        } else if (activeTab === 'modules') {
            base = items.filter(i => i.data?.type === 'module');
        } else if (activeTab === 'showcase') {
            base = items.filter(i => i.data?.type === 'showcase');
        }

        if (!search.trim()) return base;

        return base.filter(i => 
            i.data?.title?.toLowerCase().includes(search.toLowerCase()) ||
            i.data?.description?.toLowerCase().includes(search.toLowerCase()) ||
            i.data?.tags?.some((t: string) => t.toLowerCase().includes(search.toLowerCase()))
        );
    };

    const filteredMarketplace = getFilteredItems();

    const isItemTab = ['marketplace', 'starters', 'scripts', 'modules', 'showcase'].includes(activeTab);

    return (
        <div className="p-6 md:p-12 max-w-7xl mx-auto min-h-screen">
            <div className="text-center mb-10 max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase mb-6 shadow-sm">
                    <Sparkles size={14} className="text-amber-500" /> Community Ecosystem & Plugins
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
                    Plugins, Starters & Community
                </h1>
                <p className="text-lg text-muted leading-relaxed">
                    Extend your ApexKit instance with community scripts, starter templates, core modules, discussions, and multi-tenant hosting.
                </p>
            </div>

            {/* TAB NAVIGATION BAR */}
            <div className="flex justify-center mb-10 overflow-x-auto pb-2">
                <div className="bg-surface/80 p-1.5 rounded-2xl border border-border inline-flex gap-1.5 shadow-sm max-w-full overflow-x-auto no-scrollbar">
                    <TabBtn active={activeTab === 'marketplace'} onClick={() => setTab('marketplace')} icon={<Package size={16} />} label="All Items" />
                    <TabBtn active={activeTab === 'starters'} onClick={() => setTab('starters')} icon={<Layout size={16} />} label="Starters" />
                    <TabBtn active={activeTab === 'scripts'} onClick={() => setTab('scripts')} icon={<Terminal size={16} />} label="Boa Scripts" />
                    <TabBtn active={activeTab === 'modules'} onClick={() => setTab('modules')} icon={<Layers size={16} />} label="Modules" />
                    <TabBtn active={activeTab === 'showcase'} onClick={() => setTab('showcase')} icon={<Star size={16} />} label="Showcase" />
                    <TabBtn active={activeTab === 'discussions'} onClick={() => setTab('discussions')} icon={<MessageCircle size={16} />} label="Discussions" />
                    <TabBtn active={activeTab === 'issues'} onClick={() => setTab('issues')} icon={<Bug size={16} />} label="Issues" />
                    <TabBtn active={activeTab === 'tenancy'} onClick={() => setTab('tenancy')} icon={<Server size={16} />} label="Tenancy Market" />
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
                                        placeholder="Search starters, scripts, modules, showcase..." 
                                        className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-foreground focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                    />
                                </div>
                                <button 
                                    type="button" 
                                    onClick={() => setIsUploadOpen(true)} 
                                    className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-hover flex items-center justify-center gap-2 shadow-md shadow-primary/20 transition-all cursor-pointer"
                                >
                                    <Plus size={16} /> Submit Item
                                </button>
                            </div>

                            {filteredMarketplace.length === 0 ? (
                                <div className="text-center py-20 bg-surface/30 border border-border rounded-2xl p-8">
                                    <Package className="mx-auto text-muted mb-3 h-10 w-10 opacity-50" />
                                    <h3 className="text-lg font-bold text-foreground mb-1">No items found</h3>
                                    <p className="text-sm text-muted mb-4">Try clearing your search query or submit a new contribution.</p>
                                    <button onClick={() => setSearch('')} className="text-xs text-primary hover:underline font-bold">Clear Filter</button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredMarketplace.map(item => {
                                        const itemType = item.data?.type || 'script';
                                        return (
                                            <div key={item.id} className="bg-surface border border-border rounded-2xl p-6 hover:border-primary/50 transition-all flex flex-col justify-between group hover:shadow-xl relative overflow-hidden">
                                                <div>
                                                    <div className="flex items-center justify-between mb-4">
                                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                                                            itemType === 'script' ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30' :
                                                            itemType === 'site' || itemType === 'starter' ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30' :
                                                            itemType === 'module' ? 'bg-purple-500/15 text-purple-500 border border-purple-500/30' :
                                                            'bg-cyan-500/15 text-cyan-500 border border-cyan-500/30'
                                                        }`}>
                                                            {itemType === 'site' ? 'starter' : itemType}
                                                        </span>
                                                        <div className="flex items-center gap-3 text-xs text-muted font-medium">
                                                            <span className="flex items-center gap-1"><Download size={12} className="text-muted" /> {item.data?.downloads || 0}</span>
                                                            <span className="flex items-center gap-1"><Heart size={12} className="text-amber-500 fill-amber-500/20" /> {item.data?.likes || 0}</span>
                                                        </div>
                                                    </div>

                                                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors leading-snug">
                                                        {item.data?.title}
                                                    </h3>
                                                    <p className="text-sm text-muted line-clamp-3 leading-relaxed mb-4">
                                                        {item.data?.description}
                                                    </p>

                                                    {item.data?.tags && (
                                                        <div className="flex flex-wrap gap-1.5 mb-6">
                                                            {item.data.tags.map((tag: string, idx: number) => (
                                                                <span key={idx} className="px-2 py-0.5 rounded bg-foreground/5 text-muted text-[10px] font-medium border border-border">
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex gap-2 border-t border-border/60 pt-4 mt-auto">
                                                    <button 
                                                        type="button"
                                                        onClick={() => setPreviewItem(item)}
                                                        className="flex-1 py-2 bg-background hover:bg-primary/10 border border-border hover:border-primary/30 text-foreground hover:text-primary font-semibold rounded-lg text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                                                    >
                                                        <Eye size={14} /> Inspect
                                                    </button>
                                                    <a 
                                                        href={getFileUrl(item.data?.file)} 
                                                        download 
                                                        className="p-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors flex items-center justify-center"
                                                        title="Download asset"
                                                    >
                                                        <Download size={16} />
                                                    </a>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'discussions' && <DiscussionList initialItems={discussions} />}
                    {activeTab === 'issues' && <IssueList initialItems={issues} />}
                    {activeTab === 'tenancy' && <TenancyList initialItems={tenancyOffers} />}
                </>
            )}

            {previewItem && (
                <FileExplorerModal item={previewItem} onClose={() => setPreviewItem(null)} />
            )}

            {isUploadOpen && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-surface border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl relative animate-in zoom-in-95">
                        <button type="button" onClick={() => setIsUploadOpen(false)} className="absolute top-4 right-4 text-muted hover:text-foreground"><X size={20} /></button>
                        <h2 className="text-xl font-bold mb-6 text-foreground flex items-center gap-2">
                            <Plus className="text-primary" size={20} /> Submit Ecosystem Asset
                        </h2>
                        
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">Title</label>
                                <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/40 outline-none" placeholder="e.g. Stripe Webhook Handler" />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">Asset Type</label>
                                <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/40 outline-none">
                                    <option value="script">Boa JS Script (.js)</option>
                                    <option value="site">Starter Template (.zip)</option>
                                    <option value="module">Extension Module (.mod)</option>
                                    <option value="showcase">Community Showcase App</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">Description</label>
                                <textarea required rows={3} value={desc} onChange={e => setDesc(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm resize-none focus:ring-2 focus:ring-primary/40 outline-none" placeholder="Describe functionality, dependencies, and integration steps..." />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">Asset File (.js, .zip, .json, .mod)</label>
                                <input type="file" required onChange={e => setFile(e.target.files?.[0] || null)} className="w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" />
                            </div>

                            <button type="submit" disabled={isUploading} className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all cursor-pointer">
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
        <button 
            type="button"
            onClick={onClick}
            className={`px-4 py-2 rounded-xl font-bold text-xs md:text-sm flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                active 
                    ? 'bg-primary text-white shadow-md shadow-primary/20' 
                    : 'text-muted hover:text-foreground hover:bg-foreground/5'
            }`}
        >
            {icon} {label}
        </button>
    );
}
