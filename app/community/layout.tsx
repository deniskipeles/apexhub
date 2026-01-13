// =========================== /app/community/layout.tsx ===========================
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, Bug, Server, Plus } from 'lucide-react';

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Helper to check active tab
  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto min-h-screen flex flex-col">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">Community Hub</h1>
        <p className="text-muted max-w-2xl">
            Join the conversation, report bugs, or find free hosting.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-b border-border mb-8 gap-4">
        <div className="flex gap-1 overflow-x-auto w-full sm:w-auto">
            <TabLink href="/community/discussions" active={isActive('/community/discussions')} icon={MessageSquare} label="Discussions" />
            <TabLink href="/community/issues" active={isActive('/community/issues')} icon={Bug} label="Issues" />
            <TabLink href="/community/tenancy" active={isActive('/community/tenancy')} icon={Server} label="Tenancy Market" />
        </div>
      </div>

      {/* Page Content */}
      <div className="flex-1 min-h-0">
          {children}
      </div>
    </div>
  );
}

const TabLink = ({ href, active, icon: Icon, label }: any) => (
    <Link 
        href={href}
        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            active ? 'border-primary text-foreground' : 'border-transparent text-muted hover:text-foreground'
        }`}
    >
        <Icon size={18} /> {label}
    </Link>
);