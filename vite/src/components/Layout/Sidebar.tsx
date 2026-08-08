import React from 'react';
import { Home, Layers, Zap, LifeBuoy, BookOpen, Map, Cpu, Sun, Moon } from 'lucide-react';
import { useTheme } from '../ThemeContext';
import { UserMenu } from '../Auth/UserMenu';
import { Link, usePathname } from '@/lib/navigation';
import { apex } from '@/lib/apexkit';

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/features', label: 'Features', icon: Cpu },
    { href: '/docs', label: 'Documentation', icon: BookOpen },
    { href: '/ecosystem', label: 'Ecosystem', icon: Layers },
    { href: '/roadmap', label: 'Road Ahead', icon: Map },
    { href: '/optimizations', label: 'Optimizations', icon: Zap },
    { href: '/help', label: 'Help & Sandbox', icon: LifeBuoy },
  ];

  return (
    <aside className={`${className} flex-col bg-surface/50 backdrop-blur-xl`}>
        <div className="p-6">
            <Link href="/" className="flex items-center gap-3 group">
                <img 
                  src={`${apex.baseUrl}/logo`} 
                  alt="Apex Logo" 
                  className="w-7 h-7 object-contain drop-shadow-sm group-hover:scale-105 transition-transform" 
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <span className="text-xl font-bold tracking-tight text-foreground">Apex<span className="text-primary">Hub</span></span>
            </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1">
            {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
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
        
        <div className="px-4 pb-4">
             <UserMenu /> 
             
             <button type="button" onClick={toggleTheme} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted hover:text-foreground mt-2 w-full text-left transition-colors">
                 {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                 <span>Theme</span>
             </button>
        </div>
    </aside>
  );
}
