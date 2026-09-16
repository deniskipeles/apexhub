import { ApexKit } from "@apexkit/sdk"; 
import { APEX_HUB_TOKEN } from './constants';

const apiUrl = (typeof process !== 'undefined' && process.env?.VITE_API_URL) || 
               (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) || 
               'http://127.0.0.1:5000';

const tenantId = (typeof process !== 'undefined' && process.env?.VITE_TENANT_ID) || 
                 (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_TENANT_ID) || 
                 '';

const baseClient = new ApexKit(apiUrl);
export const apex = tenantId ? baseClient.tenant(tenantId) : baseClient;

if (typeof window !== 'undefined') {
  const token = localStorage.getItem(APEX_HUB_TOKEN);
  if (token) {
    apex.setToken(token);
  }
}

export async function getApexServer() {
  return apex;
}

export const getFileUrl = (filename: string) => {
  if (!filename) return '';
  try {
    const res = apex.files.getFileUrl(filename);
    if (typeof res === 'string') return res;
    return `${apiUrl}/storage/files/${filename}`;
  } catch {
    return `${apiUrl}/storage/files/${filename}`;
  }
};