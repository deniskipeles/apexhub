export type Route = 
  | 'home'
  | 'features'
  | 'docs'
  | 'doc-detail'
  | 'api-ref'
  | 'ecosystem'
  | 'roadmap'
  | 'optimizations'
  | 'optimization-detail'
  | 'blog'
  | 'blog-detail'
  | 'blog-new'
  | 'changelog'
  | 'careers'
  | 'about'
  | 'help'
  | 'download'
  | 'contact'
  | 'login'
  | 'register'
  | 'profile';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'developer' | 'user';
  joined: string;
  avatar?: string;
}

export interface DocItem {
  id: string;
  title: string;
  category: string;
  content: string;
  author: string;
  created: string;
  readTime?: string;
}

export interface DocCategoryGroup {
  category: string;
  items: DocItem[];
}

export interface OptimizationStrategy {
  id: string;
  title: string;
  content: string;
  tags: string[];
  upvotes: number;
  downvotes: number;
  author: string;
  authorEmail: string;
  created: string;
  commentsCount: number;
  comments: Comment[];
}

export interface Comment {
  id: string;
  author: string;
  authorEmail: string;
  content: string;
  created: string;
}

export interface BlogPost {
  id: string;
  headline: string;
  subheadline: string;
  body: string;
  readTime: string;
  tags: string[];
  coverImage?: string;
  author: string;
  created: string;
}

export interface EcosystemSnippet {
  id: string;
  title: string;
  description: string;
  type: 'script' | 'ai_action' | 'schema' | 'template' | 'site';
  tags: string[];
  author: string;
  fileContent: string;
  fileName: string;
  created: string;
  downloads: number;
}

export interface StarterKit {
  id: string;
  framework: string;
  description: string;
  installCommand: string;
  repoUrl: string;
  icon: string;
}

export interface ShowcaseProject {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  author: string;
}

export interface Discussion {
  id: string;
  topic: string;
  category: 'general' | 'qna' | 'showcase';
  description: string;
  author: string;
  created: string;
  replies: number;
  views: number;
  comments: Comment[];
}

export interface Issue {
  id: string;
  title: string;
  type: 'bug' | 'feature';
  description: string;
  status: 'open' | 'closed' | 'in-progress';
  upvotes: number;
  tags: string[];
  author: string;
  created: string;
  comments: Comment[];
}

export interface TenancyOffer {
  id: string;
  providerName: string;
  region: string;
  specs: string;
  description: string;
  status: 'available' | 'full' | 'waitlist';
  availableSlots: number;
}

export interface RoadmapItem {
  id: string;
  quarter: string;
  headline: string;
  description: string;
  status: 'done' | 'in-progress' | 'planned';
  progress?: number;
}

export interface ChangelogRelease {
  id: string;
  version: string;
  releaseDate: string;
  isLatest: boolean;
  body: string;
}

export interface JobOpening {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Contract' | 'Part-time';
  salary?: string;
  description: string;
  applyUrl: string;
  isOfficial: boolean;
  created: string;
}

export interface SandboxSession {
  id: string;
  sandboxId: string;
  issueTitle: string;
  description: string;
  status: 'open' | 'closed';
  created: string;
  endpointUrl: string;
  dbStats: {
    tablesCount: number;
    recordsCount: number;
    vectorIndexSizeKb: number;
    memoryUsedMb: number;
  };
}
