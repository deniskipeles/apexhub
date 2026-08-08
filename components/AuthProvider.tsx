'use client';

import { useCallback, useEffect } from 'react';
import { apex } from '@/lib/apexkit';
import { getToken, logoutAction } from '@/app/actions';

export function AuthProvider({
  token,
  children
}: {
  token: string | undefined;
  children: React.ReactNode
}) {

  // This runs once when the app hydrates on the client
  if (token) {
    apex.setToken(token);
  }

  const checkAuth = useCallback(async () => {
    if (token) {
      // 1. Ensure the main proxy client has the token
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
    // Optional: Handle token refresh logic here if needed
    checkAuth();
  }, [token]);

  return <>{children}</>;
}