import React from 'react';
import { useApexStore } from './store/useApexStore';
import { ThemeProvider } from './components/ThemeContext';
import { AuthProvider } from './components/AuthProvider';

// Layout
import { Sidebar } from './components/Layout/Sidebar';
import { MobileHeader } from './components/Layout/MobileHeader';
import { Footer } from './components/Layout/Footer';

// Pages
import { HomePage } from './pages/home/HomePage';
import { FeaturesPage } from './pages/features/FeaturesPage';
import { DocsPage } from './pages/docs/DocsPage';
import { ApiReferencePage } from './pages/docs/ApiReferencePage';
import { EcosystemPage } from './pages/ecosystem/EcosystemPage';
import { DiscussionsPage } from './pages/ecosystem/DiscussionsPage';
import { IssuesPage } from './pages/ecosystem/IssuesPage';
import { TenancyRequestPage } from './pages/ecosystem/TenancyRequestPage';
import { BlogPage } from './pages/blog/BlogPage';
import { RoadmapPage } from './pages/roadmap/RoadmapPage';
import { ChangelogPage } from './pages/changelog/ChangelogPage';
import { CareersPage } from './pages/careers/CareersPage';
import { HelpPage } from './pages/help/HelpPage';
import { DownloadPage } from './pages/download/DownloadPage';
import { AboutPage } from './pages/about/AboutPage';
import { ContactPage } from './pages/contact/ContactPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ProfilePage } from './pages/auth/ProfilePage';
import { OptimizationsPage } from './pages/optimizations/OptimizationsPage';

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
                {renderActiveView()}
              </main>
              <Footer />
            </div>
          </div>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}
