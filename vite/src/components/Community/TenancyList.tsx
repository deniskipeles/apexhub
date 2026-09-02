import React, { useState } from 'react';
import { Search, Plus, MapPin, Cpu, X, Loader2, Zap, ExternalLink } from 'lucide-react';
import { apex } from '@/lib/apexkit';
import { Link } from '@/lib/navigation';

export function TenancyList({ initialItems }: { initialItems: any[] }) {
    const [items, setItems] = useState(initialItems);
    const [search, setSearch] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [name, setName] = useState("");
    const [region, setRegion] = useState("");
    const [specs, setSpecs] = useState("");
    const [desc, setDesc] = useState("");
    const [slots, setSlots] = useState(10);
    const [status, setStatus] = useState("available");
    const [requestAccessLink, setRequestAccessLink] = useState("");

    const filteredItems = items.filter(o =>
        o.provider_name?.toLowerCase().includes(search.toLowerCase()) ||
        o.region?.toLowerCase().includes(search.toLowerCase()) ||
        o.specs?.toLowerCase().includes(search.toLowerCase())
    );

    const formatLink = (url?: string) => {
        if (!url) return null;
        const clean = url.trim();
        if (!clean) return null;
        if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('mailto:')) {
            return clean;
        }
        return `https://${clean}`;
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await apex.webhook('api-community').post('/ecosystem/tenancy', {
                provider_name: name,
                region,
                specs,
                description: desc,
                available_slots: Number(slots) || 0,
                status,
                request_access_link: requestAccessLink.trim() || null
            });
            if (res && res.success) {
                setItems([res.item, ...items]);
            }
            setIsCreateOpen(false);
            setName(""); setRegion(""); setSpecs(""); setDesc(""); setRequestAccessLink("");
        } catch (err: any) { 
            alert(err.message || "Failed to list tenancy offer. Make sure you are signed in.");
        } finally { 
            setIsSubmitting(false); 
        }
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6 animate-in fade-in">
                <div className="relative flex-1 sm:max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={16} />
                    <input
                        type="text"
                        placeholder="Search tenancy providers, regions, specs..."
                        className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-foreground focus:ring-2 focus:ring-primary/40 outline-none"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Link href="/ecosystem/tenancy/request-apexkit-official-tenancy" className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-hover flex items-center gap-2 whitespace-nowrap shadow-md shadow-primary/20 transition-all cursor-pointer">
                        <Zap size={16} /> Official Host
                    </Link>
                    <button type="button" onClick={() => setIsCreateOpen(true)} className="px-5 py-2.5 bg-surface border border-border text-foreground hover:bg-background text-sm font-bold rounded-xl flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer">
                        <Plus size={16} /> Offer Instance
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map(offer => {
                    const formattedLink = formatLink(offer.request_access_link);

                    return (
                        <div key={offer.id} className="bg-surface border border-border rounded-2xl p-6 hover:border-primary/50 transition-all flex flex-col h-full relative overflow-hidden group">
                            <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-bl-xl ${
                                offer.status === 'available' ? 'bg-emerald-500 text-white' :
                                offer.status === 'waitlist' ? 'bg-amber-500 text-black' :
                                'bg-zinc-700 text-zinc-300'
                            }`}>
                                {offer.status}
                            </div>

                            <div className="mb-4">
                                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{offer.provider_name}</h3>
                                <div className="flex items-center gap-1.5 text-xs text-muted mt-2">
                                    <MapPin size={12} /> {offer.region}
                                </div>
                            </div>

                            <div className="flex-1">
                                <div className="p-3 bg-background rounded-xl border border-border mb-4">
                                    <div className="flex items-center gap-2 text-sm text-foreground font-mono">
                                        <Cpu size={14} className="text-primary" />
                                        {offer.specs}
                                    </div>
                                </div>
                                <p className="text-sm text-muted leading-relaxed mb-6 line-clamp-3">
                                    {offer.description}
                                </p>
                            </div>

                            <div className="mt-auto border-t border-border/60 pt-4">
                                <div className="flex items-center justify-between text-xs text-muted mb-2">
                                    <span>Availability</span>
                                    <span className={(offer.available_slots || 0) > 0 ? "text-emerald-500 font-bold" : "text-zinc-500"}>
                                        {offer.available_slots || 0} Slots left
                                    </span>
                                </div>
                                <div className="w-full bg-background h-1.5 rounded-full overflow-hidden mb-4 border border-border/40">
                                    <div
                                        className={`h-full ${(offer.available_slots || 0) > 5 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                        style={{ width: `${Math.min(100, ((offer.available_slots || 0) / 20) * 100)}%` }}
                                    ></div>
                                </div>

                                {formattedLink ? (
                                    <a
                                        href={formattedLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`w-full py-2.5 rounded-xl border font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                            offer.status === 'full' 
                                                ? 'opacity-50 pointer-events-none border-border text-muted bg-surface' 
                                                : 'border-primary text-primary hover:bg-primary hover:text-white shadow-sm'
                                        }`}
                                    >
                                        <span>{offer.status === 'available' ? 'Request Access' : 'Join Waitlist'}</span>
                                        <ExternalLink size={13} />
                                    </a>
                                ) : (
                                    <button
                                        type="button"
                                        disabled={offer.status === 'full'}
                                        onClick={() => alert("No external request access link specified by this provider.")}
                                        className="w-full py-2.5 rounded-xl border border-primary text-primary hover:bg-primary hover:text-white font-bold text-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-primary"
                                    >
                                        {offer.status === 'available' ? 'Request Access' : 'Join Waitlist'}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
                {filteredItems.length === 0 && (
                    <div className="col-span-full text-center py-20 text-muted border border-dashed border-border rounded-2xl bg-surface/30">
                        No tenancy offers found.
                    </div>
                )}
            </div>

            {isCreateOpen && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-surface border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <button type="button" onClick={() => setIsCreateOpen(false)} className="absolute top-4 right-4 text-muted hover:text-foreground cursor-pointer"><X size={20} /></button>
                        <h2 className="text-xl font-bold mb-6 text-foreground">List a Server Instance</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">Provider Name</label>
                                <input required value={name} onChange={e => setName(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/40 outline-none" placeholder="e.g. Acme Cloud" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">Region</label>
                                    <input required value={region} onChange={e => setRegion(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/40 outline-none" placeholder="US-East" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">Available Slots</label>
                                    <input type="number" required value={slots} onChange={e => setSlots(Number(e.target.value))} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/40 outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">Specs</label>
                                <input required value={specs} onChange={e => setSpecs(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/40 outline-none" placeholder="2 vCPU, 4GB RAM" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">Request Access Link (URL / Form / Email)</label>
                                <input 
                                    type="text" 
                                    value={requestAccessLink} 
                                    onChange={e => setRequestAccessLink(e.target.value)} 
                                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/40 outline-none" 
                                    placeholder="https://company.com/apply or mailto:support@company.com" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">Status</label>
                                <select value={status} onChange={e => setStatus(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/40 outline-none">
                                    <option value="available">Available</option>
                                    <option value="waitlist">Waitlist</option>
                                    <option value="full">Full</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">Description</label>
                                <textarea required rows={3} value={desc} onChange={e => setDesc(e.target.value)} className="w-full bg-background border border-border rounded-xl p-4 text-sm resize-none focus:ring-2 focus:ring-primary/40 outline-none" placeholder="Detail server hardware, uptime guarantees, and hosting policies..." />
                            </div>
                            <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all cursor-pointer">
                                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'List Tenancy Offer'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}