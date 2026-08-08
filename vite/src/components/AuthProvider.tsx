import React, { useCallback, useEffect } from 'react';
import { apex } from '@/lib/apexkit';
import { logoutAction } from '@/app/actions';

export function AuthProvider({
  token,
  children
}: {
  token?: string | null;
  children: React.ReactNode
}) {
  if (token) {
    apex.setToken(token);
  }

  const checkAuth = useCallback(async () => {
    const currentToken = token || (typeof window !== 'undefined' ? localStorage.getItem('apex-hub-token') : null);
    if (currentToken) {
      apex.setToken(currentToken);
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
  }, [token]);

  useEffect(() => {
    checkAuth();
  }, [token, checkAuth]);

  return <>{children}</>;
}
