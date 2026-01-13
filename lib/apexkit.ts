
import {ApexKit} from "@/lib/sdk"
import { APEX_HUB_TOKEN } from './constants';
// Initialize Instance
export const apex = new ApexKit(process.env.NEXT_PUBLIC_API_URL || 'https://5000-01ke6hmdydtz0mhahe6ktw06fm.cloudspaces.litng.ai');

// // Client-side only: Hydrate token
// if (typeof window !== 'undefined') {
//   const token = localStorage.getItem(APEX_HUB_TOKEN);
//   if (token) {
//       apex.setToken(token);
//   }
// }

// Server-side helper (Call this in Server Components/Pages)
export async function getApexServer() {
  const client = new ApexKit(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
  
  // Dynamically import cookies to avoid build errors on client
  const { cookies } = await import('next/headers');
  const token = cookies().get(APEX_HUB_TOKEN)?.value;
  
  if (token) {
      client.setToken(token);
  }
  return client;
}

// Helper for server components
export const getFileUrl = (filename: string) => {
  return apex.files.getFileUrl(filename);
};

// Fallback Mock Data (For graceful degradation if DB is empty)
export const MOCK_FALLBACK = {
  hero: {
      headline: "The Single-Node Speed King",
      subheadline: "Build vertical-scale apps with Rust, SQLite, and In-Memory Vector Search.",
      version: "v0.1.0"
  }
};
