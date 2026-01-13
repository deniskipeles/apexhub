'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn, LogOut, User } from 'lucide-react';
import { apex } from '@/lib/apexkit';
import { useEffect, useState } from 'react';
import { logoutAction } from '@/app/actions';

export function UserMenu({ mobile = false }: { mobile?: boolean }) {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
     // Check if we have a token (Client side check)
     const token = apex.getToken();
     if (token) {
         // Optionally fetch user details if not stored in token
         // For now, just assume logged in state if token exists
         setUser({ email: 'User' }); 
     }
  }, []);

  const handleLogout = async () => {
      await logoutAction(); // Server action to clear cookie
      apex.setToken(''); // Clear SDK
      if (typeof window !== 'undefined') localStorage.removeItem('apex-hub-token');
      setUser(null);
      router.refresh();
      router.push('/');
  };

  if (user) {
      if (mobile) {
          return (
            <>
                <Link href="/profile" className="w-full flex items-center gap-4 text-lg font-medium text-foreground py-4 border-b border-border/50">
                    <User size={20} className="text-primary" /> Profile
                </Link>
                <button onClick={handleLogout} className="w-full flex items-center gap-4 text-lg font-bold text-red-500 py-4 border-b border-border/50">
                    <LogOut size={20} /> Sign Out
                </button>
            </>
          )
      }
      return (
          <div className="flex flex-col gap-1 w-full">
               <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-surface transition-colors">
                   <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary">
                       <User size={14} />
                   </div>
                   Profile
               </Link>
               <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors w-full text-left">
                   <LogOut size={16} /> Sign Out
               </button>
          </div>
      );
  }

  if (mobile) {
      return (
        <Link href="/login" className="w-full flex items-center gap-4 text-lg font-bold text-primary py-4 border-b border-border/50 mt-4">
            <LogIn size={20} /> Sign In
        </Link>
      )
  }

  return (
    <Link href="/login" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold bg-foreground/5 hover:bg-foreground/10 mb-2 transition-colors">
        <LogIn size={18} /> Sign In
    </Link>
  );
}