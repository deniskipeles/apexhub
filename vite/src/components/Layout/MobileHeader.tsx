import React, { useState } from 'react';
import { Menu, X, Home, Cpu, BookOpen, Layers, Map, Zap, LifeBuoy, Sun, Moon } from 'lucide-react';
import { useTheme } from '../ThemeContext';
import { UserMenu } from '../Auth/UserMenu';
import { Link } from '@/lib/navigation';
import { apex } from '@/lib/apexkit';

export function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false);
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
    <>
      <div className="md:hidden h-16 border-b border-border flex items-center justify-between px-4 sticky top-0 bg-background/80 backdrop-blur z-50">
        <div className="flex items-center gap-2">
          <Link href="/" className="font-bold text-lg text-foreground flex items-center gap-2">
            <img 
              src={`${apex.baseUrl}/logo`} 
              alt="Apex Logo" 
              className="w-6 h-6 object-contain" 
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <span>Apex<span className="text-primary">Hub</span></span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <button type="button" onClick={toggleTheme} className="text-muted hover:text-foreground">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button type="button" onClick={() => setIsOpen(!isOpen)} className="text-foreground p-1">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background pt-20 px-6 animate-in fade-in slide-in-from-top-5 duration-200">
          <nav className="flex flex-col space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center gap-4 text-lg font-medium text-muted hover:text-foreground py-4 border-b border-border/50"
                >
                  <Icon size={20} className="text-primary" /> {item.label}
                </Link>
              );
            })}

            {/* Passes the close handler down to collapse the mobile header */}
            <UserMenu mobile onItemClick={() => setIsOpen(false)} />
          </nav>
        </div>
      )}
    </>
  );
}