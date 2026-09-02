import { create } from 'zustand';

export interface RouteInfo {
  currentPath: string;
  currentRoute: string;
  routeParams: Record<string, string>;
  searchString: string;
}

interface ApexStoreState extends RouteInfo {
  refreshTrigger: number;
  navigate: (path: string) => void;
  refresh: () => void;
}

function parsePath(path: string): RouteInfo {
  const [pathname, search = ''] = path.split('?');
  const searchString = search ? `?${search}` : '';

  const parts = pathname.split('/').filter(Boolean);
  let currentRoute = 'home';
  const routeParams: Record<string, string> = {};

  if (parts.length === 0) {
    currentRoute = 'home';
  } else if (parts[0] === 'about') {
    currentRoute = 'about';
  } else if (parts[0] === 'features') {
    currentRoute = 'features';
  } else if (parts[0] === 'api-reference') {
    currentRoute = 'api-ref';
  } else if (parts[0] === 'roadmap') {
    currentRoute = 'roadmap';
  } else if (parts[0] === 'changelog') {
    currentRoute = 'changelog';
  } else if (parts[0] === 'careers') {
    currentRoute = 'careers';
  } else if (parts[0] === 'contact') {
    currentRoute = 'contact';
  } else if (parts[0] === 'help') {
    currentRoute = 'help';
  } else if (parts[0] === 'download') {
    currentRoute = 'download';
  } else if (parts[0] === 'login') {
    currentRoute = 'login';
  } else if (parts[0] === 'register') {
    currentRoute = 'register';
  } else if (parts[0] === 'profile') {
    currentRoute = 'profile';
  } else if (parts[0] === 'docs') {
    if (parts[1] === 'new') {
      currentRoute = 'doc-new';
    } else if (parts[1]) {
      currentRoute = 'doc-detail';
      routeParams.id = parts[1];
    } else {
      currentRoute = 'docs';
    }
  } else if (parts[0] === 'blog') {
    if (parts[1] === 'new') {
      currentRoute = 'blog-new';
    } else if (parts[1] && parts[2] === 'edit') {
      currentRoute = 'blog-edit';
      routeParams.id = parts[1];
    } else if (parts[1]) {
      currentRoute = 'blog-detail';
      routeParams.id = parts[1];
    } else {
      currentRoute = 'blog';
    }
  } else if (parts[0] === 'optimizations') {
    if (parts[1]) {
      currentRoute = 'optimization-detail';
      routeParams.id = parts[1];
    } else {
      currentRoute = 'optimizations';
    }
  } else if (parts[0] === 'ecosystem') {
    if (parts[1] === 'tenancy' && parts[2] === 'request-apexkit-official-tenancy') {
      currentRoute = 'tenancy-request';
    } else if (parts[1] === 'discussions' && parts[2]) {
      currentRoute = 'discussion-detail';
      routeParams.id = parts[2];
    } else if (parts[1] === 'issues' && parts[2]) {
      currentRoute = 'issue-detail';
      routeParams.id = parts[2];
    } else {
      currentRoute = 'ecosystem';
    }
  }

  return {
    currentPath: pathname || '/',
    currentRoute,
    routeParams,
    searchString,
  };
}

export const useApexStore = create<ApexStoreState>((set) => ({
  ...parsePath(typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/'),
  refreshTrigger: 0,
  navigate: (path: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      // Reset scroll position to top on new page navigation
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
    set(parsePath(path));
  },
  refresh: () => set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),
}));

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    useApexStore.setState(parsePath(window.location.pathname + window.location.search));
  });
}
