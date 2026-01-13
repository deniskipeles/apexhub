'use client';

import React, { useState } from 'react';
import { Copy, Check, Database, Shield, Server, Box, Terminal, Code } from 'lucide-react';

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

interface ApiParam {
    name: string;
    type: string;
    required: boolean;
    desc: string;
}

interface ApiEndpoint {
    id: string;
    method: Method;
    path: string;
    title: string;
    description: string;
    params?: ApiParam[];
    response: string;
}

interface ApiSection {
    id: string;
    title: string;
    icon: React.ElementType;
    endpoints: ApiEndpoint[];
}

const DATA: ApiSection[] = [
    {
        id: 'context',
        title: 'Context & Routing',
        icon: Box,
        endpoints: [
            {
                id: 'root-api',
                method: 'GET',
                path: 'https://api.apexkit.io/api/v1/...',
                title: 'Root API',
                description: 'The global control plane. Used for creating tenants and managing system-wide settings.',
                response: `// Default context`
            },
            {
                id: 'tenant-api',
                method: 'GET',
                path: 'https://{tenant-id}.api.apexkit.io/api/v1/...',
                title: 'Tenant API',
                description: 'Isolated environment for a specific customer. Data here is physically separated from others.',
                response: `// Subdomain routing automatically selects the tenant database.`
            },
            {
                id: 'sandbox-api',
                method: 'GET',
                path: '/sandbox/{session-id}/api/v1/...',
                title: 'Sandbox API',
                description: 'Ephemeral development environment for AI prototyping. Created via the Architect API.',
                response: `// Path-based routing selects the sandbox database.`
            }
        ]
    },
    {
        id: 'auth',
        title: 'Authentication',
        icon: Shield,
        endpoints: [
            {
                id: 'login',
                method: 'POST',
                path: '/api/v1/auth/login',
                title: 'Login',
                description: 'Authenticate a user and receive a JWT token.',
                params: [
                    { name: 'email', type: 'string', required: true, desc: 'User email.' },
                    { name: 'password', type: 'string', required: true, desc: 'User password.' }
                ],
                response: `{
  "token": "eyJhbGciOiJIUzI1...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "user"
  }
}`
            },
            {
                id: 'register',
                method: 'POST',
                path: '/api/v1/auth/register',
                title: 'Register',
                description: 'Create a new user account in the current context (Root/Tenant).',
                response: `{ ...user_object }`
            }
        ]
    },
    {
        id: 'records',
        title: 'Records (CRUD)',
        icon: Database,
        endpoints: [
            {
                id: 'list-records',
                method: 'GET',
                path: '/api/v1/collections/{id}/records',
                title: 'List Records',
                description: 'Fetch paginated records. Supports filtering and relation expansion.',
                params: [
                    { name: 'page', type: 'number', required: false, desc: 'Page number (default 1).' },
                    { name: 'sort', type: 'string', required: false, desc: 'Sort field (e.g., "-created").' },
                    { name: 'filter', type: 'json', required: false, desc: 'MongoDB-style filter object.' },
                    { name: 'expand', type: 'string', required: false, desc: 'Comma-separated relations.' }
                ],
                response: `{
  "items": [
    { "id": 1, "data": { "title": "Hello" }, "created": "..." }
  ],
  "total": 100
}`
            },
            {
                id: 'search-vector',
                method: 'POST',
                path: '/api/v1/collections/{id}/search-text-vector',
                title: 'Semantic Search',
                description: 'Perform a natural language search using vector embeddings.',
                params: [
                    { name: 'query_text', type: 'string', required: true, desc: 'The search query.' },
                    { name: 'limit', type: 'number', required: false, desc: 'Max results (default 10).' }
                ],
                response: `[
  { 
    "id": 55, 
    "data": { ... },
    "_score": 0.89 
  }
]`
            }
        ]
    },
    {
        id: 'sdk',
        title: 'Client SDK',
        icon: Code,
        endpoints: [
            {
                id: 'sdk-init',
                method: 'GET',
                path: 'npm install apexkit-sdk',
                title: 'Initialization',
                description: 'Initialize the SDK with context switching support.',
                response: `import { ApexKit } from 'apexkit-sdk';

// 1. Root Connection
const pb = new ApexKit('http://localhost:5000');

// 2. Switch to Tenant
const tenantClient = pb.tenant('client-a');
await tenantClient.collection('posts').list();

// 3. Switch to Sandbox
const sandboxClient = pb.sandbox('uuid-123');`
            }
        ]
    },
    {
        id: 'realtime',
        title: 'Realtime',
        icon: Server,
        endpoints: [
            {
                id: 'ws-connect',
                method: 'GET',
                path: '/ws',
                title: 'WebSocket Connection',
                description: 'Connect to the realtime stream. Messages are automatically scoped to the current tenant/sandbox.',
                response: `// Subscribe Message
{
  "type": "Subscribe",
  "payload": {
    "collection_id": 5,
    "event_type": "Insert"
  }
}

// Event Message
{
  "event": "Insert",
  "payload": { "data": { ... } }
}`
            }
        ]
    }
];

export default function ApiReferencePage() {
    const scrollToEndpoint = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-background text-foreground">
            
            {/* Sidebar Navigation */}
            <aside className="w-full md:w-64 border-r border-border bg-surface/50 backdrop-blur-xl md:sticky md:top-0 md:h-screen overflow-y-auto flex-shrink-0">
                <div className="p-6">
                    <h2 className="text-sm font-bold text-muted uppercase tracking-wider mb-6">API Reference</h2>
                    <div className="space-y-6">
                        {DATA.map(section => (
                            <div key={section.id}>
                                <div className="flex items-center gap-2 text-foreground font-semibold mb-2 px-2">
                                    <section.icon size={16} className="text-primary" />
                                    {section.title}
                                </div>
                                <ul className="space-y-0.5 border-l border-border ml-2 pl-2">
                                    {section.endpoints.map(ep => (
                                        <li key={ep.id}>
                                            <button 
                                                onClick={() => scrollToEndpoint(ep.id)}
                                                className="w-full text-left px-3 py-1.5 text-sm text-muted hover:text-foreground hover:bg-foreground/5 rounded transition-colors truncate"
                                            >
                                                {ep.title}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
                <div className="max-w-4xl mx-auto p-6 md:p-12">
                    
                    <div className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-primary/10 rounded-xl text-primary"><Terminal size={32} /></div>
                            <h1 className="text-4xl font-bold text-foreground">API Documentation</h1>
                        </div>
                        <p className="text-muted text-lg leading-relaxed">
                            The ApexKit API is a unified interface for Root, Tenant, and Sandbox environments. 
                            It is RESTful, resource-oriented, and supports real-time WebSocket subscriptions.
                        </p>
                        <div className="mt-6 p-4 bg-surface border border-border rounded-lg flex items-center gap-3 text-sm font-mono text-muted">
                            <span className="text-primary font-bold">Base URL:</span>
                            <span>https://api.apexkit.io/api/v1</span>
                        </div>
                    </div>

                    <div className="space-y-16">
                        {DATA.map(section => (
                            <div key={section.id} id={section.id}>
                                <div className="flex items-center gap-3 mb-8 border-b border-border pb-4">
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                        <section.icon size={24} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-foreground">{section.title}</h2>
                                </div>

                                <div className="space-y-12">
                                    {section.endpoints.map(ep => (
                                        <EndpointCard key={ep.id} endpoint={ep} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 pt-10 border-t border-border text-center text-muted">
                        <p>Need help? Check out the <a href="/docs" className="text-primary hover:underline">Full Guides</a> or join our <a href="/community" className="text-primary hover:underline">Community</a>.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}

const EndpointCard = ({ endpoint }: { endpoint: ApiEndpoint }) => {
    const methodColors: Record<string, string> = {
        GET: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        POST: 'bg-green-500/10 text-green-500 border-green-500/20',
        PATCH: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
        DELETE: 'bg-red-500/10 text-red-500 border-red-500/20',
    };

    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(endpoint.response);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div id={endpoint.id} className="scroll-mt-24">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                <div>
                    <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-3">
                        {endpoint.title}
                    </h3>
                    <p className="text-muted mb-4">{endpoint.description}</p>
                </div>
                <div className={`px-3 py-1.5 rounded-md font-mono text-sm font-bold border shrink-0 ${methodColors[endpoint.method] || 'bg-surface border-border'}`}>
                    {endpoint.method}
                </div>
            </div>

            <div className="bg-surface border border-border rounded-lg overflow-hidden mb-6 font-mono text-sm">
                <div className="px-4 py-3 bg-black/20 border-b border-border text-foreground break-all flex items-center gap-3">
                    <span className="text-muted select-none uppercase text-xs font-bold tracking-wider">Route</span>
                    {endpoint.path}
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Parameters */}
                <div>
                    <h4 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">Parameters</h4>
                    {endpoint.params ? (
                        <div className="space-y-3">
                            {endpoint.params.map(param => (
                                <div key={param.name} className="flex gap-4 p-3 rounded-lg border border-border bg-surface/30">
                                    <div className="font-mono text-sm text-primary w-24 shrink-0 break-all">{param.name}</div>
                                    <div className="text-sm flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs text-muted font-mono bg-white/5 px-1.5 py-0.5 rounded border border-white/10">{param.type}</span>
                                            {param.required && <span className="text-[10px] text-red-400 font-bold uppercase">Required</span>}
                                        </div>
                                        <p className="text-muted">{param.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted italic">No parameters required.</p>
                    )}
                </div>

                {/* Response Example */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">Example</h4>
                        <button 
                            onClick={handleCopy} 
                            className="text-xs flex items-center gap-1 text-muted hover:text-foreground transition-colors"
                        >
                            {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                    </div>
                    <div className="bg-[#0d0d0d] rounded-lg border border-border overflow-hidden relative group">
                        <pre className="p-4 text-xs md:text-sm font-mono text-zinc-300 overflow-x-auto custom-scrollbar">
                            {endpoint.response}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
};