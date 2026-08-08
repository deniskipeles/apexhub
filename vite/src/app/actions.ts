import { APEX_HUB_TOKEN } from '@/lib/constants';

export async function loginAction(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(APEX_HUB_TOKEN, token);
  }
}

export async function logoutAction() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(APEX_HUB_TOKEN);
  }
}

export async function getToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(APEX_HUB_TOKEN);
  }
  return null;
}
