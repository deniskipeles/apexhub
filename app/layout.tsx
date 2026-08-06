import './globals.css';
import { Sidebar } from '@/components/Layout/Sidebar';
import { MobileHeader } from '@/components/Layout/MobileHeader';
import { Footer } from '@/components/Layout/Footer';
import { ThemeProvider } from '@/components/ThemeContext';
import { cookies } from 'next/headers';
import { AuthProvider } from '@/components/AuthProvider';
import { APEX_HUB_TOKEN } from '@/lib/constants';
import 'highlight.js/styles/github-dark.css'; // You can change this to your preferred theme (e.g., atom-one-dark.css)

// Opt-in the entire application to the Edge Runtime (required for Cloudflare Pages)
export const runtime = 'edge';

export const metadata = {
  title: 'ApexHub',
  description: 'The vertical-scale backend platform.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(APEX_HUB_TOKEN)?.value || ((typeof window !== 'undefined') ? localStorage.getItem(APEX_HUB_TOKEN) : null);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.png" />
        {/*
          The script below is to prevent a flash of the incorrect theme (FOUC).
          It's placed in the head and runs before React renders.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (
                  localStorage.theme === 'dark' || 
                  (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
                ) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="bg-background text-foreground flex min-h-screen font-sans">
        <AuthProvider token={token}>
          {/* Wrap EVERYTHING in ThemeProvider */}
          <ThemeProvider>
            <Sidebar className="hidden md:flex w-64 border-r border-border sticky top-0 h-screen" />
            <div className="flex-1 flex flex-col min-w-0">
              <MobileHeader />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}