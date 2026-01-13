'use client';

import { useEffect } from 'react';
import { apex } from '@/lib/apexkit';

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

  useEffect(() => {
     // Optional: Handle token refresh logic here if needed
  }, [token]);

  return <>{children}</>;
}