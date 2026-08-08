// =========================== /teamspace/studios/this_studio/apex/apexhub-next/app/api-reference/page.tsx ===========================
'use client';

import React, { useState, useEffect } from 'react';
import { 
    Server, Database, Shield, Search, 
    HardDrive, Cpu, Terminal, Zap, 
    Copy, Check, ChevronRight, Hash, Box
} from 'lucide-react';

// --- TYPES ---

type Language = 'sdk' | 'curl';

interface DocItem {
    id: string;
    title: string;
    method?: string; // GET, POST, etc.
    endpoint?: string; // /api/v1/...
    description: React.ReactNode;
    sdk: string;
    curl: string;
}

interface DocSection {
    id: string;
    title: string;
    icon: any;
    items: DocItem[];
}

// --- DATA: THE FULL APEXKIT SURFACE AREA ---

const DOCS: DocSection[] = [
    {
        id: 'setup',
        title: 'Initialization & Context',
        icon: Box,
        items: [
            {
                id: 'init',
                title: 'Initialize Client',
                description: 'Configure the SDK. ApexKit supports multi-tenancy natively. You can switch contexts (Root, Tenant, Sandbox) using the same client library.',
                sdk: `import { ApexKit } from 'apexkit-sdk';

// 1. Root Connection (Platform Admin)
const client = new ApexKit('https://api.apexkit.io');

// 2. Tenant Context (Customer Data)
const tenantClient = client.tenant('customer-123');

// 3. Sandbox Context (AI Architect)
const sandboxClient = client.sandbox('session-uuid');`,
                curl: `# Root
export BASE_URL="https://api.apexkit.io/api/v1"

# Tenant (Subdomain Routing)
export BASE_URL="https://customer-123.api.apexkit.io/api/v1"

# Sandbox (Path Routing)
export BASE_URL="https://api.apexkit.io/sandbox/session-uuid/api/v1"`
            }
        ]
    },
    {
        id: 'auth',
        title: 'Authentication',
        icon: Shield,
        items: [
            {
                id: 'login',
                title: 'Login',
                method: 'POST',
                endpoint: '/auth/login',
                description: 'Authenticate a user to receive a JWT. The token scope adapts automatically to the client context (Root/Tenant).',
                sdk: `const { token, user } = await client.auth.login(
  'alice@example.com', 
  'password123'
);

// SDK automatically attaches token to future requests
console.log(user.role); // "admin" | "user"`,
                curl: `curl -X POST "$BASE_URL/auth/login" \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "alice@example.com", 
    "password": "password123"
  }'`
            },
            {
                id: 'register',
                title: 'Register',
                method: 'POST',
                endpoint: '/auth/register',
                description: 'Create a new user. Metadata is a flexible JSON object for profile fields.',
                sdk: `await client.auth.register(
  'bob@example.com', 
  'securePass!', 
  'user', // Role
  { full_name: "Bob", plan: "free" } // Metadata
);`,
                curl: `curl -X POST "$BASE_URL/auth/register" \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "bob@example.com",
    "password": "securePass!",
    "role": "user",
    "metadata": { "full_name": "Bob" }
  }'`
            }
        ]
    },
    {
        id: 'records',
        title: 'Database (CRUD)',
        icon: Database,
        items: [
            {
                id: 'list',
                title: 'List Records',
                method: 'GET',
                endpoint: '/collections/{id}/records',
                description: 'Fetch paginated data. Supports JSON filtering and Relation expansion.',
                sdk: `const result = await client.collection('posts').list({
  page: 1,
  per_page: 20,
  sort: '-created',
  filter: { 
    status: 'published',
    views: { $gt: 100 }
  },
  expand: 'author_id'
});

console.log(result.items);`,
                curl: `curl -G "$BASE_URL/collections/posts/records" \\
  -H "Authorization: Bearer $TOKEN" \\
  --data-urlencode 'filter={"status":"published"}' \\
  --data-urlencode 'sort=-created' \\
  --data-urlencode 'expand=author_id'`
            },
            {
                id: 'create',
                title: 'Create Record',
                method: 'POST',
                endpoint: '/collections/{id}/records',
                description: 'Insert a new record. Schema validation runs automatically on the server.',
                sdk: `const post = await client.collection('posts').create({
  title: "Hello World",
  content: "My first post...",
  author_id: client.auth.user.id
});`,
                curl: `curl -X POST "$BASE_URL/collections/posts/records" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "data": {
      "title": "Hello World",
      "author_id": "user_123"
    }
  }'`
            },
            {
                id: 'relations',
                title: 'Manage Relations',
                method: 'POST',
                endpoint: '/.../relations',
                description: 'Manually link two records (Graph Edge). Useful for Many-to-Many relationships.',
                sdk: `await client.collection('posts').addRelation(
  'post_123', // Origin Record
  'tags',     // Target Collection
  'tag_55',   // Target Record
  'tagged_as' // Relation Name
);`,
                curl: `curl -X POST "$BASE_URL/collections/posts/records/post_123/relations" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "target_collection_id": "tags",
    "target_record_id": "tag_55",
    "relation_name": "tagged_as"
  }'`
            }
        ]
    },
    {
        id: 'search',
        title: 'Search & AI',
        icon: Search,
        items: [
            {
                id: 'instant',
                title: 'Instant Search',
                method: 'GET',
                endpoint: '/.../instant-search',
                description: 'Uses the Tantivy inverted index (RAM-based) for millisecond-fast full-text search with typo tolerance.',
                sdk: `// Matches "Apple", "Aplle", "Apples"
const hits = await client.collection('products')
    .searchRecordsInstantlyWithOSE("aplle");
    
console.log(hits[0].snippet); // { name: "<b>Apple</b> Watch" }`,
                curl: `curl -G "$BASE_URL/collections/products/instant-search" \\
  --data-urlencode "q=aplle" \\
  --data-urlencode "limit=10"`
            },
            {
                id: 'vector',
                title: 'Semantic Search',
                method: 'POST',
                endpoint: '/.../search-text-vector',
                description: 'Converts query text to an embedding (via configured model like Gemini/Bert) and performs HNSW similarity search.',
                sdk: `// Finds conceptually similar items
const results = await client.collection('docs')
    .searchTextVector("how to secure api", 5);

// Results sorted by similarity score`,
                curl: `curl -X POST "$BASE_URL/collections/docs/search-text-vector" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query_text": "how to secure api",
    "limit": 5
  }'`
            }
        ]
    },
    {
        id: 'files',
        title: 'File Storage',
        icon: HardDrive,
        items: [
            {
                id: 'upload',
                title: 'Upload File',
                method: 'POST',
                endpoint: '/storage/upload',
                description: 'Uploads to configured backend (Local Disk or S3). Returns a File Object with public URL.',
                sdk: `const file = document.getElementById('fileInput').files[0];
const uploaded = await client.files.upload(file);

console.log(uploaded.url); // Public URL
console.log(uploaded.filename); // Store this in DB`,
                curl: `curl -X POST "$BASE_URL/storage/upload" \\
  -H "Authorization: Bearer $TOKEN" \\
  -F "file=@/path/to/image.png"`
            }
        ]
    },
    {
        id: 'logic',
        title: 'Serverless Logic',
        icon: Terminal,
        items: [
            {
                id: 'run',
                title: 'Run Script',
                method: 'POST',
                endpoint: '/run/{name}',
                description: 'Execute a server-side JavaScript function. Ideal for payment processing, heavy calculations, or secure webhooks.',
                sdk: `const response = await client.scripts.run(
  'process-payment', 
  { 
    amount: 5000, 
    currency: 'USD' 
  }
);`,
                curl: `curl -X POST "$BASE_URL/run/process-payment" \\
  -H "Content-Type: application/json" \\
  -d '{ "amount": 5000, "currency": "USD" }'`
            },
            {
                id: 'ai-run',
                title: 'Run AI Action',
                method: 'POST',
                endpoint: '/ai/run/{slug}',
                description: 'Execute a stored Prompt Template securely on the server. The server handles API keys and context.',
                sdk: `const res = await client.ai.run('summarize', {
    text: "Long article content..."
});

console.log(res.result); // AI Generated Text`,
                curl: `curl -X POST "$BASE_URL/ai/run/summarize" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "variables": {
       "text": "Long article content..."
    }
  }'`
            }
        ]
    },
    {
        id: 'realtime',
        title: 'Realtime (WS)',
        icon: Zap,
        items: [
            {
                id: 'subscribe',
                title: 'Subscribe to Events',
                method: 'WS',
                endpoint: '/ws',
                description: 'Listen for database changes (Insert, Update, Delete) or custom broadcast signals.',
                sdk: `const rt = new ApexKitRealtimeWSClient(url, token);
rt.connect();

// 1. DB Changes
rt.subscribe({
    collectionId: 5,
    eventType: 'Insert'
});

// 2. Custom Signals (Chat)
rt.subscribe({ channel: 'room_1' });

rt.onEvent((msg) => console.log(msg));`,
                curl: `# Connect via WebSocket Client
ws://localhost:5000/ws

# Send Payload:
{
  "type": "Subscribe",
  "payload": {
    "collection_id": 5,
    "event_type": "Insert"
  }
}`
            }
        ]
    }
];

export default function ApiReferencePage() {
    const [activeSection, setActiveSection] = useState(DOCS[0].id);

    const scrollToSection = (id: string) => {
        setActiveSection(id);
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-background text-foreground">
            
            {/* --- SIDEBAR --- */}
            <aside className="w-full md:w-64 border-r border-border bg-surface/50 backdrop-blur-xl md:sticky md:top-0 md:h-screen overflow-y-auto flex-shrink-0 z-20">
                <div className="p-6">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
                            <Terminal size={18} />
                        </div>
                        <span className="font-bold text-lg">API Ref</span>
                    </div>

                    <nav className="space-y-1">
                        {DOCS.map(section => (
                            <button
                                key={section.id}
                                onClick={() => scrollToSection(section.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                    activeSection === section.id 
                                    ? 'bg-primary/10 text-primary' 
                                    : 'text-muted hover:bg-surface hover:text-foreground'
                                }`}
                            >
                                <section.icon size={16} />
                                {section.title}
                            </button>
                        ))}
                    </nav>
                </div>
            </aside>

            {/* --- CONTENT --- */}
            <main className="flex-1 min-w-0">
                <div className="max-w-5xl mx-auto p-6 md:p-12 pb-24">
                    
                    <div className="mb-16">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Documentation</h1>
                        <p className="text-xl text-muted leading-relaxed max-w-3xl">
                            ApexKit offers a dual-interface: a fully typed <strong>TypeScript SDK</strong> for rapid development, and a standard <strong>REST API</strong> for universal compatibility.
                        </p>
                    </div>

                    <div className="space-y-24">
                        {DOCS.map(section => (
                            <section key={section.id} id={section.id} className="scroll-mt-24">
                                <div className="flex items-center gap-3 mb-8 border-b border-border pb-4">
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                        <section.icon size={24} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-foreground">{section.title}</h2>
                                </div>

                                <div className="space-y-12">
                                    {section.items.map(item => (
                                        <DocBlock key={item.id} item={item} />
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>

                </div>
            </main>
        </div>
    );
}

// --- SUB COMPONENTS ---

function DocBlock({ item }: { item: DocItem }) {
    const [lang, setLang] = useState<Language>('sdk');
    const [copied, setCopied] = useState(false);

    const code = lang === 'sdk' ? item.sdk : item.curl;

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
            {/* Text Side */}
            <div className="xl:col-span-2 space-y-4">
                <div className="flex items-center gap-3">
                    {item.method && (
                        <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wider ${getMethodColor(item.method)}`}>
                            {item.method}
                        </span>
                    )}
                    <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
                </div>
                
                {item.endpoint && (
                    <div className="font-mono text-xs bg-surface border border-border px-3 py-2 rounded text-muted break-all">
                        {item.endpoint}
                    </div>
                )}

                <div className="text-sm text-muted leading-relaxed">
                    {item.description}
                </div>
            </div>

            {/* Code Side */}
            <div className="xl:col-span-3">
                <div className="rounded-xl border border-border bg-[#0d0d0d] overflow-hidden shadow-2xl">
                    {/* Toolbar */}
                    <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setLang('sdk')}
                                className={`text-xs font-bold pb-2 -mb-2 border-b-2 transition-colors ${lang === 'sdk' ? 'text-primary border-primary' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}
                            >
                                SDK (JS)
                            </button>
                            <button 
                                onClick={() => setLang('curl')}
                                className={`text-xs font-bold pb-2 -mb-2 border-b-2 transition-colors ${lang === 'curl' ? 'text-primary border-primary' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}
                            >
                                cURL
                            </button>
                        </div>
                        <button onClick={handleCopy} className="text-zinc-500 hover:text-white transition-colors">
                            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                        </button>
                    </div>

                    {/* Editor */}
                    <div className="p-4 overflow-x-auto custom-scrollbar">
                        <pre className="text-sm font-mono text-blue-100 leading-relaxed">
                            {code}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
}

function getMethodColor(method: string) {
    switch (method) {
        case 'GET': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        case 'POST': return 'bg-green-500/10 text-green-500 border-green-500/20';
        case 'PATCH': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
        case 'DELETE': return 'bg-red-500/10 text-red-500 border-red-500/20';
        case 'WS': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
        default: return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
    }
}