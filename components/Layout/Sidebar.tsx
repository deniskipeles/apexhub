'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Layers, Zap, LifeBuoy, BookOpen, MessageCircle, Map, Cpu, LogIn, Sun, Moon } from 'lucide-react';
import { useTheme } from '../ThemeContext';
import { UserMenu } from '../Auth/UserMenu';

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/features', label: 'Features', icon: Cpu },
    { href: '/docs', label: 'Documentation', icon: BookOpen },
    { href: '/ecosystem', label: 'Ecosystem', icon: Layers },
    { href: '/community', label: 'Community', icon: MessageCircle },
    { href: '/roadmap', label: 'Road Ahead', icon: Map },
    { href: '/optimizations', label: 'Optimizations', icon: Zap },
    { href: '/help', label: 'Help & Sandbox', icon: LifeBuoy },
  ];

  return (
    <aside className={`${className} flex-col bg-surface/50 backdrop-blur-xl`}>
        {/* Logo Area */}
        <div className="p-6">
            <Link href="/" className="flex items-center gap-3">
                <span className="text-xl font-bold tracking-tight text-foreground">Apex<span className="text-primary">Hub</span></span>
            </Link>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 space-y-1">
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                            isActive
                                ? 'bg-primary/10 text-primary border border-primary/20'
                                : 'text-muted hover:text-foreground hover:bg-foreground/5 border border-transparent'
                        }`}
                    >
                        <Icon size={18} className={isActive ? 'text-primary' : 'text-muted group-hover:text-foreground'} />
                        {item.label}
                    </Link>
                );
            })}
        </nav>
        
        {/* Footer Actions */}
        <div className="px-4 pb-4">
             <UserMenu /> 
             
             <button onClick={toggleTheme} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted hover:text-foreground mt-2">
                 {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                 <span>Theme</span>
             </button>
        </div>
    </aside>
  );
}