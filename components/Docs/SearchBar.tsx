'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Zap, BrainCircuit } from 'lucide-react';

interface Props {
    initialQuery?: string;
    initialType?: string;
}

export function SearchBar({ initialQuery = "", initialType = "instant" }: Props) {
    const router = useRouter();
    const [query, setQuery] = useState(initialQuery);
    const [type, setType] = useState(initialType);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Push query params to URL to trigger Server Component refresh
        router.push(`/docs?q=${encodeURIComponent(query)}&type=${type}`);
    };

    return (
        <div className="relative group z-50">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-muted group-focus-within:text-primary transition-colors" />
            </div>
            
            <form onSubmit={handleSearch}>
                <input 
                    className="w-full bg-surface border border-border rounded-xl pl-12 pr-32 py-4 text-base shadow-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-muted" 
                    placeholder={type === 'instant' ? "Search keywords..." : "Ask a question..."}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                />
            </form>

            <div className="absolute inset-y-0 right-2 flex items-center">
                <div className="bg-background/50 rounded-lg p-1 flex gap-1 border border-border/50">
                    <button 
                        type="button"
                        onClick={() => { setType('instant'); }}
                        className={`p-1.5 rounded-md transition-all ${type === 'instant' ? 'bg-background shadow text-primary' : 'text-muted hover:text-foreground'}`}
                        title="Instant Text Search (Tantivy)"
                    >
                        <Zap size={14} />
                    </button>
                    <button 
                        type="button"
                        onClick={() => { setType('vector'); }}
                        className={`p-1.5 rounded-md transition-all ${type === 'vector' ? 'bg-background shadow text-primary' : 'text-muted hover:text-foreground'}`}
                        title="Semantic Vector Search (AI)"
                    >
                        <BrainCircuit size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}