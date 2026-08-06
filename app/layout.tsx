import './globals.css';
import { Sidebar } from '@/components/Layout/Sidebar';
import { MobileHeader } from '@/components/Layout/MobileHeader';
import { Footer } from '@/components/Layout/Footer';
import { ThemeProvider } from '@/components/ThemeContext';
import { AuthProvider } from '@/components/AuthProvider';
import 'highlight.js/styles/github-dark.css';

export const metadata = {
  title: 'ApexHub',
  description: 'The vertical-scale backend platform.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.png" />
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
        <AuthProvider>
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