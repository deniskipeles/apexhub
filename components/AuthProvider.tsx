'use client';

import { useCallback, useEffect } from 'react';
import { apex } from '@/lib/apexkit';
import { logoutAction } from '@/app/actions';
import { APEX_HUB_TOKEN } from '@/lib/constants';

export function AuthProvider({
  children
}: {
  children: React.ReactNode
}) {
  const checkAuth = useCallback(async () => {
    const token = apex.getToken() || (typeof window !== 'undefined' ? localStorage.getItem(APEX_HUB_TOKEN) : null);
    if (token) {
      apex.setToken(token);
      try {
        const user = await apex.auth.getMe();
        if (!user?.id) {
          logoutAction();
          apex.setToken(null);
        }
      } catch (e) {
        logoutAction();
        apex.setToken(null);
      }
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return <>{children}</>;
}