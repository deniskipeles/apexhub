'use client';

import Link from 'next/link';
import { getCategoryIcon } from '@/lib/icons';
import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';

export function DocsSidebar({ groups }: { groups: Record<string, any[]> }) {
  // Optional: Add state here if you want to collapse/expand categories
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
      Object.keys(groups).reduce((acc, key) => ({ ...acc, [key]: true }), {})
  );

  const toggle = (cat: string) => {
      setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  return (
    <aside className="w-full md:w-72 border-r border-border p-6 bg-surface/30 md:h-[calc(100vh-64px)] md:overflow-y-auto md:sticky md:top-0">
        <div className="mb-6">
             <Link 
                href="/docs/new"
                className="w-full py-2.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
             >
                <Plus size={16} /> Contribute Guide
             </Link>
        </div>
        
        <nav className="space-y-6">
           {Object.entries(groups).map(([category, items]) => {
               const Icon = getCategoryIcon(category);
               const isOpen = openCategories[category];

               return (
                   <div key={category}>
                       <button 
                           onClick={() => toggle(category)}
                           className="flex items-center justify-between w-full text-left mb-2 group"
                       >
                           <h3 className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-wider px-2 group-hover:text-foreground transition-colors">
                               <Icon size={14} /> {category.replace(/-/g, ' ')}
                           </h3>
                           {isOpen ? <ChevronDown size={12} className="text-muted" /> : <ChevronRight size={12} className="text-muted" />}
                       </button>
                       
                       {isOpen && (
                           <ul className="space-y-0.5 border-l border-border ml-2 pl-2 animate-in slide-in-from-left-1 duration-200">
                               {items.map((doc: any) => (
                                   <li key={doc.id}>
                                       <Link 
                                           href={`/docs/${doc.id}`} 
                                           className="block px-3 py-1.5 text-sm text-muted hover:text-foreground rounded-md hover:bg-surface truncate transition-colors"
                                       >
                                           {doc.data.title}
                                       </Link>
                                   </li>
                               ))}
                           </ul>
                       )}
                   </div>
               );
           })}
        </nav>
    </aside>
  );
}