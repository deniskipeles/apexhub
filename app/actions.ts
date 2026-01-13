'use server';

import { APEX_HUB_TOKEN } from '@/lib/constants';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(token: string) {
  // Set HTTP-only cookie
  cookies().set(APEX_HUB_TOKEN, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
    sameSite: 'lax',
  });
}

export async function logoutAction() {
  cookies().delete(APEX_HUB_TOKEN);
  redirect('/');
}

export async function getToken() {
  const cookieStore = cookies();
  return cookieStore.get(APEX_HUB_TOKEN)?.value;
}