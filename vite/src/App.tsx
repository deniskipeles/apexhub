import React, { Suspense, lazy } from 'react';
import { useApexStore } from './store/useApexStore';
import { ThemeProvider } from './components/ThemeContext';
import { AuthProvider } from './components/AuthProvider';
import { Loader2 } from 'lucide-react';

// Layout
import { Sidebar } from './components/Layout/Sidebar';
import { MobileHeader } from './components/Layout/MobileHeader';
import { Footer } from './components/Layout/Footer';

// Code-Split Lazy Loaded Pages
const HomePage = lazy(() => import('./pages/home/HomePage'));
const FeaturesPage = lazy(() => import('./pages/features/FeaturesPage'));
const DocsPage = lazy(() => import('./pages/docs/DocsPage'));
const ApiReferencePage = lazy(() => import('./pages/docs/ApiReferencePage'));
const EcosystemPage = lazy(() => import('./pages/ecosystem/EcosystemPage'));
const DiscussionsPage = lazy(() => import('./pages/ecosystem/DiscussionsPage'));
const IssuesPage = lazy(() => import('./pages/ecosystem/IssuesPage'));
const TenancyRequestPage = lazy(() => import('./pages/ecosystem/TenancyRequestPage'));
const BlogPage = lazy(() => import('./pages/blog/BlogPage'));
const RoadmapPage = lazy(() => import('./pages/roadmap/RoadmapPage'));
const ChangelogPage = lazy(() => import('./pages/changelog/ChangelogPage'));
const CareersPage = lazy(() => import('./pages/careers/CareersPage'));
const HelpPage = lazy(() => import('./pages/help/HelpPage'));
const DownloadPage = lazy(() => import('./pages/download/DownloadPage'));
const AboutPage = lazy(() => import('./pages/about/AboutPage'));
const ContactPage = lazy(() => import('./pages/contact/ContactPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ProfilePage = lazy(() => import('./pages/auth/ProfilePage'));
const OptimizationsPage = lazy(() => import('./pages/optimizations/OptimizationsPage'));

function PageLoader() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <Loader2 className="animate-spin text-primary h-8 w-8" />
    </div>
  );
}

export default function App() {
  const { currentRoute } = useApexStore();

  const renderActiveView = () => {
    switch (currentRoute) {
      case 'home':
        return <HomePage />;
      case 'about':
        return <AboutPage />;
      case 'features':
        return <FeaturesPage />;
      case 'api-ref':
        return <ApiReferencePage />;
      case 'docs':
      case 'doc-detail':
      case 'doc-new':
        return <DocsPage />;
      case 'blog':
      case 'blog-detail':
      case 'blog-new':
      case 'blog-edit':
        return <BlogPage />;
      case 'ecosystem':
        return <EcosystemPage />;
      case 'discussion-detail':
        return <DiscussionsPage />;
      case 'issue-detail':
        return <IssuesPage />;
      case 'tenancy-request':
        return <TenancyRequestPage />;
      case 'roadmap':
        return <RoadmapPage />;
      case 'optimizations':
      case 'optimization-detail':
        return <OptimizationsPage />;
      case 'changelog':
        return <ChangelogPage />;
      case 'careers':
        return <CareersPage />;
      case 'contact':
        return <ContactPage />;
      case 'help':
        return <HelpPage />;
      case 'download':
        return <DownloadPage />;
      case 'login':
        return <LoginPage />;
      case 'register':
        return <RegisterPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20 selection:text-primary">
          <MobileHeader />
          <div className="flex flex-1 min-h-screen">
            <Sidebar className="hidden md:flex w-64 shrink-0 border-r border-border" />
            <div className="flex-1 flex flex-col min-w-0">
              <main className="flex-1 animate-in fade-in duration-200">
                <Suspense fallback={<PageLoader />}>
                  {renderActiveView()}
                </Suspense>
              </main>
              <Footer />
            </div>
          </div>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}