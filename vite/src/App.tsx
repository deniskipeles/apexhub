import React from 'react';
import { useApexStore } from './store/useApexStore';
import { ThemeProvider } from './components/ThemeContext';
import { AuthProvider } from './components/AuthProvider';

// Layout
import { Sidebar } from './components/Layout/Sidebar';
import { MobileHeader } from './components/Layout/MobileHeader';
import { Footer } from './components/Layout/Footer';

// Views
import { HomeView } from './components/Home/HomeView';
import { FeaturesView } from './components/Features/FeaturesView';
import { DocsView } from './components/Docs/DocsView';
import { ApiReferenceView } from './components/ApiReference/ApiReferenceView';
import { EcosystemView } from './components/Ecosystem/EcosystemView';
import { RequestOfficialTenancyView } from './components/Ecosystem/RequestOfficialTenancyView';
import { BlogView } from './components/Blog/BlogView';
import { RoadmapView } from './components/Roadmap/RoadmapView';
import { ChangelogView } from './components/Changelog/ChangelogView';
import { CareersView } from './components/Careers/CareersView';
import { HelpView } from './components/Help/HelpView';
import { DownloadView } from './components/Download/DownloadView';
import { AboutView } from './components/About/AboutView';
import { ContactView } from './components/Contact/ContactView';
import { LoginView } from './components/Auth/LoginView';
import { RegisterView } from './components/Auth/RegisterView';
import { ProfileView } from './components/Auth/ProfileView';
import { OptimizationsView } from './components/Optimizations/OptimizationsView';

export default function App() {
  const { currentRoute } = useApexStore();

  const renderActiveView = () => {
    switch (currentRoute) {
      case 'home':
        return <HomeView />;
      case 'about':
        return <AboutView />;
      case 'features':
        return <FeaturesView />;
      case 'api-ref':
        return <ApiReferenceView />;
      case 'docs':
      case 'doc-detail':
      case 'doc-new':
        return <DocsView />;
      case 'blog':
      case 'blog-detail':
      case 'blog-new':
      case 'blog-edit':
        return <BlogView />;
      case 'ecosystem':
      case 'discussion-detail':
      case 'issue-detail':
        return <EcosystemView />;
      case 'tenancy-request':
        return <RequestOfficialTenancyView />;
      case 'roadmap':
        return <RoadmapView />;
      case 'optimizations':
      case 'optimization-detail':
        return <OptimizationsView />;
      case 'changelog':
        return <ChangelogView />;
      case 'careers':
        return <CareersView />;
      case 'contact':
        return <ContactView />;
      case 'help':
        return <HelpView />;
      case 'download':
        return <DownloadView />;
      case 'login':
        return <LoginView />;
      case 'register':
        return <RegisterView />;
      case 'profile':
        return <ProfileView />;
      default:
        return <HomeView />;
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
