import { ApexKit } from "@apexkit/sdk"; 
import { APEX_HUB_TOKEN } from './constants';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

export const apex = new ApexKit(API_URL);

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
    return `${API_URL}/storage/files/${filename}`;
  } catch {
    return `${API_URL}/storage/files/${filename}`;
  }
};

export const MOCK_FALLBACK = {
  hero: {
    headline: "The Single-Node Speed King",
    subheadline: "Build vertical-scale apps with Rust, SQLite, and In-Memory Vector Search.",
    version: "v0.1.0"
  }
};
