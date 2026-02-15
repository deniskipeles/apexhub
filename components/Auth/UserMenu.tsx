'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn, LogOut, User } from 'lucide-react';
import { apex } from '@/lib/apexkit';
import { useCallback, useEffect, useState } from 'react';
import { getToken, logoutAction } from '@/app/actions';
import { APEX_HUB_TOKEN } from '@/lib/constants';

export function UserMenu({ mobile = false }: { mobile?: boolean }) {
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    const checkAuth = useCallback(async () => {
        // Check if we have a token (Client side check)
        const token = apex.getToken();
        const storedToken = token || await getToken() || ((typeof window !== 'undefined') ? localStorage.getItem(APEX_HUB_TOKEN) : null);
        if (storedToken) {
            // 1. Ensure the main proxy client has the token
            apex.setToken(storedToken);
            try {
                const user = await apex.auth.getMe();
                setUser(user);
                if (!user?.id) {
                    logoutAction();
                    apex.setToken(null);
                }
            } catch (e) {
                logoutAction();
                apex.setToken(null);
                setUser(null);
            }
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [apex.getToken()]);

    const handleLogout = async () => {
        await logoutAction(); // Server action to clear cookie
        apex.setToken(''); // Clear SDK
        if (typeof window !== 'undefined') localStorage.removeItem(APEX_HUB_TOKEN);
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