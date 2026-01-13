'use client';

import React, { useState } from 'react';
import { 
  Server, Search, Plus, MapPin, Cpu, X, Loader2 
} from 'lucide-react';
import { apex } from '@/lib/apexkit';

export function TenancyList({ initialItems }: { initialItems: any[] }) {
  const [items, setItems] = useState(initialItems);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [specs, setSpecs] = useState("");
  const [desc, setDesc] = useState("");

  const filteredItems = items.filter(o => 
      o.data.provider_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
          const res = await apex.collection('tenancy_offers').create({
              provider_name: name,
              region,
              specs,
              description: desc,
              status: 'available',
              available_slots: 10
          });
          setItems([res, ...items]);
          setIsCreateOpen(false);
          // Reset
          setName(""); setRegion(""); setSpecs(""); setDesc("");
      } catch (err) { console.error(err); } 
      finally { setIsSubmitting(false); }
  };

  return (
    <div>
        <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
            <div className="relative flex-1 sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                <input 
                    type="text" 
                    placeholder="Search providers..." 
                    className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-lg text-sm text-foreground focus:ring-1 focus:ring-primary outline-none"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>
            <button onClick={() => setIsCreateOpen(true)} className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-hover flex items-center gap-2 whitespace-nowrap shadow-sm transition-colors">
                <Plus size={16} /> Offer Instance
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(offer => (
                <div key={offer.id} className="bg-surface border border-border rounded-xl p-6 hover:border-primary/50 transition-all flex flex-col h-full relative overflow-hidden group">
                    <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-bl-xl ${
                        offer.data.status === 'available' ? 'bg-green-500 text-white' :
                        offer.data.status === 'waitlist' ? 'bg-yellow-500 text-black' :
                        'bg-zinc-700 text-zinc-300'
                    }`}>
                        {offer.data.status}
                    </div>

                    <div className="mb-4">
                        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{offer.data.provider_name}</h3>
                        <div className="flex items-center gap-1.5 text-xs text-muted mt-2">
                            <MapPin size={12} /> {offer.data.region}
                        </div>
                    </div>

                    <div className="flex-1">
                        <div className="p-3 bg-background rounded-lg border border-border mb-4">
                            <div className="flex items-center gap-2 text-sm text-foreground font-mono">
                                <Cpu size={14} className="text-primary" />
                                {offer.data.specs}
                            </div>
                        </div>
                        <p className="text-sm text-muted leading-relaxed mb-6 line-clamp-3">
                            {offer.data.description}
                        </p>
                    </div>

                    <div className="mt-auto">
                        <div className="flex items-center justify-between text-xs text-muted mb-3">
                            <span>Availability</span>
                            <span className={offer.data.available_slots > 0 ? "text-green-500 font-bold" : "text-zinc-500"}>
                                {offer.data.available_slots} Slots left
                            </span>
                        </div>
                        <div className="w-full bg-background h-1.5 rounded-full overflow-hidden mb-4">
                            <div 
                                className={`h-full ${offer.data.available_slots > 10 ? 'bg-green-500' : 'bg-yellow-500'}`} 
                                style={{ width: `${Math.min(100, (offer.data.available_slots / 50) * 100)}%` }}
                            ></div>
                        </div>
                        <button 
                            disabled={offer.data.status === 'full'}
                            className="w-full py-2.5 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-primary"
                        >
                            {offer.data.status === 'available' ? 'Request Access' : 'Join Waitlist'}
                        </button>
                    </div>
                </div>
            ))}
            {filteredItems.length === 0 && <div className="col-span-full text-center py-20 text-muted border border-dashed border-border rounded-xl">No offers found.</div>}
        </div>

        {isCreateOpen && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-surface border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl relative animate-in zoom-in-95">
                    <button onClick={() => setIsCreateOpen(false)} className="absolute top-4 right-4 text-muted hover:text-foreground"><X /></button>
                    <h2 className="text-xl font-bold mb-6">List a Server</h2>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-muted mb-2">Provider Name</label>
                            <input required value={name} onChange={e => setName(e.target.value)} className="w-full bg-background border border-border rounded-lg px-4 py-2" placeholder="e.g. Acme Cloud" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted mb-2">Region</label>
                            <input required value={region} onChange={e => setRegion(e.target.value)} className="w-full bg-background border border-border rounded-lg px-4 py-2" placeholder="e.g. US-East" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted mb-2">Specs</label>
                            <input required value={specs} onChange={e => setSpecs(e.target.value)} className="w-full bg-background border border-border rounded-lg px-4 py-2" placeholder="e.g. 2 vCPU, 4GB RAM" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted mb-2">Description</label>
                            <textarea required rows={3} value={desc} onChange={e => setDesc(e.target.value)} className="w-full bg-background border border-border rounded-lg px-4 py-2 resize-none" placeholder="Availability details..." />
                        </div>
                        <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover flex items-center justify-center gap-2">
                            {isSubmitting ? <Loader2 className="animate-spin" /> : 'List Offer'}
                        </button>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
}