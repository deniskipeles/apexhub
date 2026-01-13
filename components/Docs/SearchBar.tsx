'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { apex } from '@/lib/apexkit';

export function SearchBar() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await apex.collection('docs').searchTextVector(query);
        setResults(res);
    };

    return (
        <div className="relative">
             <form onSubmit={handleSearch}>
                <input 
                    className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2" 
                    placeholder="Search docs..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                />
             </form>
             {/* Render results dropdown */}
        </div>
    );
}