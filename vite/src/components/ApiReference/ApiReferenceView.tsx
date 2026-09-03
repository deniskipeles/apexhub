import React, { useState, useMemo } from 'react';
import { 
    Box, Shield, Database, Search, HardDrive, 
    Terminal, Zap, BrainCircuit, Layers, Radio, 
    Copy, Check, Code2, Sparkles, ExternalLink,
    Sliders, RefreshCw, FileText
} from 'lucide-react';

type Language = 'sdk' | 'curl';

interface DocItem {
    id: string;
    title: string;
    method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE' | 'WS' | 'SSE' | 'GQL';
    endpoint?: string;
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

const DOCS: DocSection[] = [
    {
        id: 'setup',
        title: 'Initialization & Scopes',
        icon: Box,
        items: [
            {
                id: 'init-client',
                title: 'Client Initialization & Scopes',
                description: 'Initialize the client. ApexKit supports multi-tenancy and ephemeral sandboxes natively. Switch contexts seamlessly using the same client instance.',
                sdk: `import { ApexKit } from '@apexkit/sdk';

// 1. Root Platform Instance
const apex = new ApexKit('https://api.apexkit.io');

// 2. Tenant Context (Isolated Database & Asset Storage)
const tenantApex = apex.tenant('acme-corp');

// 3. Ephemeral Sandbox Context (Prototyping & AI Sessions)
const sandboxApex = apex.sandbox('4a8e2b10-5c3d');`,
                curl: `# Root API Base
export BASE_URL="https://api.apexkit.io/api/v1"

# Tenant API Base (Path or Subdomain Routing)
export BASE_URL="https://api.apexkit.io/tenant/acme-corp/api/v1"

# Sandbox API Base (Ephemeral Workspace)
export BASE_URL="https://api.apexkit.io/sandbox/4a8e2b10-5c3d/api/v1"`
            },
            {
                id: 'custom-headers',
                title: 'Custom Headers & API Keys',
                description: 'Set custom headers or composite API keys (System, Tenant, Secret, or Public) for server-side operations.',
                sdk: `// Set global API key for subsequent requests
apex.setHeader('x-api-key', 'root_sys_prod_d0376d..._5e26');

// Set multiple custom headers
apex.setHeaders({
  'x-api-key': 'tnt_acme_sk_prod_..._1a2b',
  'X-Custom-Client': 'Backend-Worker'
});`,
                curl: `# Pass fast-fail composite API key via header
curl -X GET "$BASE_URL/collections" \\
  -H "x-api-key: root_sys_prod_d0376d..._5e26"`
            }
        ]
    },
    {
        id: 'auth',
        title: 'Authentication & Identity',
        icon: Shield,
        items: [
            {
                id: 'auth-login',
                title: 'User Login',
                method: 'POST',
                endpoint: '/auth/login',
                description: 'Authenticate an email and password to receive a JWT. The token scope automatically locks to the active context (Root or Tenant).',
                sdk: `const { token, user } = await apex.auth.login(
  'developer@acme.com', 
  'securePassword123'
);

// Token is automatically stored and applied to future requests
console.log(user.id, user.role, user.scope);`,
                curl: `curl -X POST "$BASE_URL/auth/login" \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "developer@acme.com", 
    "password": "securePassword123"
  }'`
            },
            {
                id: 'auth-register',
                title: 'User Registration',
                method: 'POST',
                endpoint: '/auth/register',
                description: 'Register a new user profile. Metadata is a flexible JSON object for custom fields.',
                sdk: `const res = await apex.auth.register(
  'sarah@company.com', 
  'strongPass123!', 
  { name: 'Sarah Connor', title: 'Lead Architect' },
  'developer' // Optional role
);`,
                curl: `curl -X POST "$BASE_URL/auth/register" \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "sarah@company.com",
    "password": "strongPass123!",
    "role": "developer",
    "metadata": { "name": "Sarah Connor" }
  }'`
            },
            {
                id: 'auth-me',
                title: 'Get & Update Profile',
                method: 'PATCH',
                endpoint: '/auth/me',
                description: 'Fetch the authenticated user profile or perform a non-destructive recursive merge on their metadata.',
                sdk: `// Fetch current user
const user = await apex.auth.getMe();

// Non-destructive metadata update
const updated = await apex.auth.updateMeMetadata({
  theme: 'dark',
  notifications: { email: true, push: false }
});`,
                curl: `# Get Current Profile
curl -X GET "$BASE_URL/auth/me" \\
  -H "Authorization: Bearer $TOKEN"

# Update Profile Metadata
curl -X PATCH "$BASE_URL/auth/me" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{ "metadata": { "theme": "dark" } }'`
            },
            {
                id: 'oauth2',
                title: 'OAuth2 Authentication',
                method: 'GET',
                endpoint: '/auth/github & /auth/google',
                description: 'Redirect users to GitHub or Google OAuth2 flows. Seamlessly links external identities to existing email accounts.',
                sdk: `// Trigger GitHub Login with post-auth redirect
apex.auth.loginWithGithub('https://app.com/dashboard');

// Trigger Google Login with post-auth redirect
apex.auth.loginWithGoogle('https://app.com/dashboard');`,
                curl: `# GitHub OAuth Ingress
https://api.apexkit.io/api/v1/auth/github?redirect_to=https://app.com/dashboard

# Google OAuth Ingress
https://api.apexkit.io/api/v1/auth/google?redirect_to=https://app.com/dashboard`
            }
        ]
    },
    {
        id: 'database',
        title: 'Database & Records (CRUD)',
        icon: Database,
        items: [
            {
                id: 'db-list',
                title: 'List Records & Query Filters',
                method: 'GET',
                endpoint: '/collections/{id}/records',
                description: 'Paginate records with SQL pushdown, complex JSON filters ($gt, $in, $nin, $contains), and relation expansion with limit/offset syntax.',
                sdk: `const res = await apex.collection('products').list({
  page: 1,
  per_page: 20,
  sort: '-created',
  filter: {
    category: { $in: ['hardware', 'gadgets'] },
    price: { $gt: 50 },
    in_stock: true
  },
  expand: 'category_id,reviews(5,0).author_id' // Nested expansion
});

console.log(res.items, res.total);`,
                curl: `curl -G "$BASE_URL/collections/products/records" \\
  -H "Authorization: Bearer $TOKEN" \\
  --data-urlencode 'filter={"category":{"$in":["hardware","gadgets"]},"price":{"$gt":50}}' \\
  --data-urlencode 'sort=-created' \\
  --data-urlencode 'expand=category_id,reviews(5,0).author_id'`
            },
            {
                id: 'db-create',
                title: 'Create Record',
                method: 'POST',
                endpoint: '/collections/{id}/records',
                description: 'Insert a new record into a collection. Validated against JSONB schema rules with auto-injected owner and timestamp fields.',
                sdk: `const record = await apex.collection('tasks').create({
  title: 'Optimize Vector Index',
  priority: 'high',
  assigned_to: 'user_123'
});

console.log(record.id, record.data);`,
                curl: `curl -X POST "$BASE_URL/collections/tasks/records" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "data": {
      "title": "Optimize Vector Index",
      "priority": "high"
    }
  }'`
            },
            {
                id: 'db-relations',
                title: 'Graph Relation Links',
                method: 'POST',
                endpoint: '/collections/{id}/records/{id}/relations',
                description: 'Explicitly link or unlink directional relationship edges between two records across different collections.',
                sdk: `// Link record 101 to category 55
await apex.collection('articles').addRelation(
  101,          // Origin Record ID
  'categories', // Target Collection ID/Name
  55,           // Target Record ID
  'tagged_in'   // Relation Name
);

// Unlink relationship
await apex.collection('articles').removeRelation(101, 'categories', 55, 'tagged_in');`,
                curl: `curl -X POST "$BASE_URL/collections/articles/records/101/relations" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "target_collection_id": 55,
    "target_record_id": 55,
    "relation_name": "tagged_in"
  }'`
            },
            {
                id: 'db-query-engine',
                title: 'Advanced SQL Query Engine',
                method: 'POST',
                endpoint: '/collections/{id}/query',
                description: 'Execute analytical queries with aggregations (sum, avg, count), grouping, date extractions, and post-processing pipelines.',
                sdk: `const stats = await apex.collection('orders').searchRecordsWithSQLQueryEngine({
  from: 'orders',
  select: [
    { field: 'total', fn: 'sum', as: 'revenue' },
    { field: 'created', fn: 'month', as: 'month' }
  ],
  where: { status: 'completed' },
  group_by: ['month'],
  pipeline: [
    { op: 'cumulative', args: { field: 'revenue', output_field: 'cumulative_revenue' } }
  ]
});`,
                curl: `curl -X POST "$BASE_URL/collections/orders/query" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "from": "orders",
    "select": [{"field": "total", "fn": "sum", "as": "revenue"}],
    "group_by": ["created"]
  }'`
            }
        ]
    },
    {
        id: 'search',
        title: 'Search & Dual AI Vectors',
        icon: Search,
        items: [
            {
                id: 'search-instant',
                title: 'Tantivy Full-Text Instant Search',
                method: 'GET',
                endpoint: '/collections/{id}/instant-search',
                description: 'Memory-mapped inverted index search with English morphological stemming, regex prefix typeahead, and typo tolerance in < 10ms.',
                sdk: `// Matches "Apple", "Apples", "Aplle" with typo tolerance
const hits = await apex.collection('catalog')
  .searchRecordsInstantlyWithOSE('aplle');

console.log(hits[0].id, hits[0].score, hits[0].snippet);`,
                curl: `curl -G "$BASE_URL/collections/catalog/instant-search" \\
  --data-urlencode "q=aplle" \\
  --data-urlencode "limit=10"`
            },
            {
                id: 'search-vector-text',
                title: 'Semantic Vector Search (Text)',
                method: 'POST',
                endpoint: '/collections/{id}/search-vector-with-text',
                description: 'Embeds query text on the server (BGE, Gemma-300M, or Qwen3-0.6B) and searches the in-memory HNSW index for nearest matches.',
                sdk: `const results = await apex.collection('knowledge_base')
  .searchVectorWithText('how to configure database replication', {
    per_page: 10,
    expand: 'author_id'
  });

// Results returned sorted by L2 distance ascending
console.log(results.items);`,
                curl: `curl -X POST "$BASE_URL/collections/knowledge_base/search-vector-with-text" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query_text": "how to configure database replication",
    "limit": 10
  }'`
            },
            {
                id: 'search-cross-modal',
                title: 'Cross-Modal Search (Text-to-Image & Image-to-Image)',
                method: 'POST',
                endpoint: '/collections/{id}/search-image-vector-with-text',
                description: 'Search visual asset vectors using natural language text queries or uploaded Base64 photos in a joint SigLIP2 / CLIP embedding space.',
                sdk: `// 1. Text-to-Image Search (e.g. Natural Language Query)
const textToImageHits = await apex.collection('photos')
  .searchImageVectorWithText('vintage red sports car', 5);

// 2. Image-to-Image Similarity Search (Base64 Image Input)
const imageToImageHits = await apex.collection('photos')
  .searchImageVectorWithImage('data:image/png;base64,iVBORw0KGgo...', 5);`,
                curl: `# Search images with natural language text
curl -X POST "$BASE_URL/collections/photos/search-image-vector-with-text" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{ "query_text": "vintage red sports car", "limit": 5 }'

# Search images with Base64 image photo
curl -X POST "$BASE_URL/collections/photos/search-image-vector-with-image" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{ "image_data": "data:image/png;base64,...", "limit": 5 }'`
            }
        ]
    },
    {
        id: 'storage',
        title: 'Storage, Media & Tus Resumable',
        icon: HardDrive,
        items: [
            {
                id: 'file-upload',
                title: 'Standard File Upload',
                method: 'POST',
                endpoint: '/storage/upload',
                description: 'Multipart file upload with automatic metadata extraction, duplicate prevention, and optional vectorization triggers.',
                sdk: `const file = document.querySelector('input[type="file"]').files[0];
const stored = await apex.files.upload(file);

console.log(stored.id, stored.filename, stored.url);`,
                curl: `curl -X POST "$BASE_URL/storage/upload" \\
  -H "Authorization: Bearer $TOKEN" \\
  -F "file=@/path/to/document.pdf"`
            },
            {
                id: 'file-tus',
                title: 'Tus 1.0.0 Resumable Uploads',
                method: 'POST',
                endpoint: '/storage/upload/tus',
                description: 'Chunked multi-gigabyte upload protocol supporting pause, resume, progress callbacks, and network crash recovery.',
                sdk: `const uploader = apex.files.uploadResumable(largeFile, {
  chunkSize: 512 * 1024, // 512 KB chunks
  onProgress: ({ percentage, bytesUploaded, bytesTotal }) => {
    console.log(\`Upload: \${percentage}% (\${bytesUploaded}/\${bytesTotal} bytes)\`);
  },
  onSuccess: (file) => console.log('File Ready:', file.url),
  onError: (err) => console.error('Upload Error:', err)
});

// Pause / Resume / Abort controls
uploader.pause();
await uploader.resume();`,
                curl: `# 1. Create Tus Session
curl -X POST "$BASE_URL/storage/upload/tus" \\
  -H "Tus-Resumable: 1.0.0" \\
  -H "Upload-Length: 104857600" \\
  -H "Upload-Metadata: filename dGVzdC5tcDQ="

# 2. Patch Chunk
curl -X PATCH "$BASE_URL/storage/upload/tus/{upload_id}" \\
  -H "Tus-Resumable: 1.0.0" \\
  -H "Upload-Offset: 0" \\
  -H "Content-Type: application/offset+octet-stream" \\
  --data-binary "@chunk_part_1.bin"`
            },
            {
                id: 'file-transform',
                title: 'Image Tuning & Signed URLs',
                method: 'GET',
                endpoint: '/storage/file/{filename}',
                description: 'On-the-fly dynamic image resizing, AVIF / WebP conversion, Gaussian blur, and time-expiring S3 / Local signed URLs.',
                sdk: `// Public transformed URL
const imgUrl = apex.files.getFileUrl('hero.png', {
  thumb: '800x600',
  format: 'webp',
  quality: 85,
  blur: 5
});

// Time-limited signed URL (e.g. 1 hour)
const signedUrl = await apex.files.getFileUrl('invoice.pdf', {
  signed: true,
  expiresIn: 3600
});`,
                curl: `# Image Transformation URL
GET "$BASE_URL/storage/file/hero.png?thumb=800x600&format=webp&quality=85&blur=5"

# Request Signed URL
GET "$BASE_URL/storage/files/invoice.pdf?expires_in=3600"`
            },
            {
                id: 'opengraph',
                title: 'Dynamic OpenGraph Image Renderer',
                method: 'GET',
                endpoint: '/storage/files/opengraph',
                description: 'Generates dynamic PNG social share cards from SVG & Tera templates with word wrapping and logo blending.',
                sdk: `const ogUrl = apex.files.getOpenGraphUrl('default', [
  { type: 'text', target: 'TITLE', value: 'Introducing ApexKit' },
  { type: 'text', target: 'SUBTITLE', value: 'High performance backend runtime' },
  { type: 'image', target: 'IMAGE_URL', value: 'cover.png' }
], { format: 'png', quality: 90 });

// Place into <meta property="og:image" content={ogUrl} />`,
                curl: `GET "$BASE_URL/storage/files/opengraph?template=default&data=%5B%7B%22type%22%3A%22text%22%2C%22target%22%3A%22TITLE%22%2C%22value%22%3A%22Hello%22%7D%5D&format=png"`
            }
        ]
    },
    {
        id: 'webhooks',
        title: 'Serverless TypeScript & Webhooks',
        icon: Terminal,
        items: [
            {
                id: 'webhook-call',
                title: 'Fluent Webhook Calling',
                method: 'POST',
                endpoint: '/webhook/{name}/{*subpath}',
                description: 'Execute zero-build TypeScript / Hono endpoints deployed on the server with fluent HTTP method helpers.',
                sdk: `// Call Hono subroutes deployed inside 'api-community'
const items = await apex.webhook('api-community').get('/ecosystem/items', { 
  tab: 'starters' 
});

// Post payload to a webhook
const res = await apex.webhook('api-files').post('/inspect', { 
  filename: 'bundle.zip' 
});`,
                curl: `# Call named Webhook Subpath
curl -X GET "$BASE_URL/webhook/api-community/ecosystem/items?tab=starters" \\
  -H "Authorization: Bearer $TOKEN"

curl -X POST "$BASE_URL/webhook/api-files/inspect" \\
  -H "Content-Type: application/json" \\
  -d '{ "filename": "bundle.zip" }'`
            },
            {
                id: 'script-sample',
                title: 'Serverless TypeScript Script Format',
                description: 'Native TypeScript script running in QuickJS with global built-ins ($db, $files, $fs, $cache, $realtime, $mail, $util).',
                sdk: `// Example: webhooks/process-payment.ts
import { Hono } from "https://esm.sh/hono";

const app = new Hono();

app.post("/charge", async (c) => {
  const { amount, customerId } = await c.req.json();

  // 1. Insert into data.db
  const record = await $db.records.create("payments", {
    customer_id: customerId,
    amount: amount,
    status: "paid"
  });

  // 2. Real-time WebSocket Signal
  await $realtime.send("finance", "payment_received", { id: record.id });

  return c.json({ success: true, payment_id: record.id });
});

export default async function (req: Request): Promise<Response> {
  return app.fetch(req);
}`,
                curl: `# Test the deployed endpoint
curl -X POST "$BASE_URL/webhook/process-payment/charge" \\
  -H "Content-Type: application/json" \\
  -d '{ "amount": 2500, "customerId": 42 }'`
            }
        ]
    },
    {
        id: 'ai-actions',
        title: 'Streaming AI & Prompt Engine',
        icon: BrainCircuit,
        items: [
            {
                id: 'ai-run',
                title: 'Run AI Action with SSE Token Streaming',
                method: 'POST',
                endpoint: '/ai/run/{slug}',
                description: 'Execute prompt templates with Google Gemini, Groq, or OpenAI, with automatic RAG vector injection and real-time token streaming.',
                sdk: `// Run stored AI action with streaming callback
const response = await apex.ai.run(
  'summarize-article',
  { article_text: 'Long document text...' },
  (chunk) => {
    // Real-time token stream callback
    process.stdout.write(chunk);
  }
);

console.log('Complete Output:', response.result);`,
                curl: `curl -X POST "$BASE_URL/ai/run/summarize-article" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "variables": { "article_text": "Long document text..." }
  }'`
            },
            {
                id: 'ai-edit-code',
                title: 'AI Code & Template Refactoring',
                method: 'POST',
                endpoint: '/admin/ai/edit-code',
                description: 'Refactor JavaScript, TypeScript, or Tera HTML templates using AI with runtime context awareness.',
                sdk: `const { code } = await apex.ai.editCode(
  "Add pagination parameters and try/catch error handling",
  existingScriptCode,
  "script", // "script" | "template"
  "gemini-2.5-flash"
);`,
                curl: `curl -X POST "$BASE_URL/admin/ai/edit-code" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Add pagination parameters",
    "current_code": "export default async function(req) {...}",
    "context_type": "script",
    "model": "gemini-2.5-flash"
  }'`
            }
        ]
    },
    {
        id: 'realtime',
        title: 'Real-time WebSockets & SSE',
        icon: Zap,
        items: [
            {
                id: 'rt-ws',
                title: 'WebSocket Realtime Client',
                method: 'WS',
                endpoint: '/ws',
                description: 'Stream database events, subscribe to scoped broadcast channels, or perform instant searches over WebSocket.',
                sdk: `import { ApexKitRealtimeWSClient } from '@apexkit/sdk';

const ws = new ApexKitRealtimeWSClient(apex.baseUrl, apex.getToken());
ws.connect();

// 1. Subscribe to Database Changes
ws.subscribe({
  collectionId: 5,
  eventType: 'Insert',
  dataFilter: { priority: 'high' }
});

// 2. Subscribe to Ephemeral Chat Channel
ws.subscribe({ channel: 'room_101', customEvent: 'chat_msg' });

// 3. Broadcast Ephemeral Signal (Client-to-Client)
ws.sendSignal('room_101', 'typing', { user: 'Alice' });

// 4. Perform Instant Search over WebSocket
const results = await ws.search(5, 'search keyword', 10);

ws.onEvent((event) => console.log('Live Event:', event));`,
                curl: `# Connect via WebSocket
ws://localhost:5000/ws

# Send Subscribe Message:
{
  "type": "Subscribe",
  "payload": {
    "collection_id": 5,
    "event_type": "Insert"
  }
}`
            },
            {
                id: 'rt-sse',
                title: 'Server-Sent Events (SSE)',
                method: 'SSE',
                endpoint: '/sse',
                description: 'Read-only HTTP event stream with automatic reconnection for real-time live feeds and telemetry.',
                sdk: `import { ApexKitRealtimeSSEClient } from '@apexkit/sdk';

const sse = new ApexKitRealtimeSSEClient(apex.baseUrl, apex.getToken());
sse.connect({ channel: 'notifications', eventName: 'alert' });

sse.onEvent((msg) => {
  console.log('SSE Alert Received:', msg);
});`,
                curl: `curl -N -H "Authorization: Bearer $TOKEN" \\
  "$BASE_URL/sse?channel=notifications&event=alert"`
            }
        ]
    },
    {
        id: 'graphql',
        title: 'GraphQL Dynamic Schema',
        icon: Radio,
        items: [
            {
                id: 'gql-query',
                title: 'Execute Dynamic GraphQL Queries',
                method: 'GQL',
                endpoint: '/graphql',
                description: 'Dynamic schema generated automatically from your collection definitions with nested relation joins and script resolvers.',
                sdk: `const data = await apex.graphql(\`
  query GetArticles {
    articles(limit: 10, where: { published: true }) {
      total
      items {
        id
        title
        author_id {
          id
          email
          role
        }
        comments_via_article_id(limit: 5) {
          items {
            id
            content
          }
        }
      }
    }
  }
\`);

console.log(data.articles.items);`,
                curl: `curl -X POST "$BASE_URL/graphql" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "query { articles(limit: 5) { total items { id title } } }"
  }'`
            }
        ]
    },
    {
        id: 'admin',
        title: 'Multi-Tenancy & Administration',
        icon: Layers,
        items: [
            {
                id: 'admin-tenants',
                title: 'Tenant Management',
                method: 'POST',
                endpoint: '/admin/tenants',
                description: 'Provision, inspect, or manage isolated physical SQLite database tenants with dedicated storage folders and quotas.',
                sdk: `// Provision a new isolated tenant
const tenant = await apex.admins.createTenant('customer-123');

// Update tenant status ('active' | 'suspended' | 'archived')
await apex.admins.updateTenantStatus('customer-123', 'active');

// List all registered tenants
const tenants = await apex.admins.listTenants();`,
                curl: `# Create Tenant
curl -X POST "$BASE_URL/admin/tenants" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{ "tenant_id": "customer-123" }'`
            },
            {
                id: 'admin-sandboxes',
                title: 'Ephemeral Sandbox Lifecycles',
                method: 'POST',
                endpoint: '/admin/sandboxes',
                description: 'Spin up 5ms isolated test environments with selective data cloning strategies and publish them to production.',
                sdk: `// Create sandbox with selective cloning
const sandbox = await apex.admins.createSandbox(
  'Test New Feature',
  'selected', // 'none' | 'schema' | 'partial' | 'full' | 'selected'
  50,         // Record limit
  'gemini-2.5-flash',
  'Initialize schema for ecommerce',
  ['products', 'orders'], // Collections to clone
  ['process-order']       // Scripts to clone
);

// Publish changes back to main database
const plugin = await apex.admins.publishSandbox(sandbox.id);`,
                curl: `curl -X POST "$BASE_URL/admin/sandboxes" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Test Sandbox",
    "clone_strategy": "schema"
  }'`
            },
            {
                id: 'admin-keys',
                title: 'Composite API Keys',
                method: 'POST',
                endpoint: '/admin/keys',
                description: 'Generate fast-fail composite API keys scoped to system roots or specific tenants with CORS bypass flags.',
                sdk: `const { key, info } = await apex.admins.createApiKey(
  'Stripe-Integration',
  'admin',               // Default role
  'tenant:customer-123', // Scope
  true,                  // Bypass CORS
  'sk',                  // Env Type ('sys' | 'tnnt' | 'sk' | 'pk')
  ['admin', 'editor'],   // Authorized roles
  'customer-123'         // Target Tenant
);

console.log('Secret API Key (Save Now):', key);`,
                curl: `curl -X POST "$BASE_URL/admin/keys" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Integration-Key",
    "env_type": "sk",
    "target_tenant": "customer-123",
    "roles": ["admin"]
  }'`
            }
        ]
    }
];

export function ApiReferenceView() {
    const [activeSection, setActiveSection] = useState<string>(DOCS[0]!.id);
    const [filterQuery, setFilterQuery] = useState('');

    const filteredDocs = useMemo(() => {
        if (!filterQuery.trim()) return DOCS;
        const q = filterQuery.toLowerCase();
        return DOCS.map(section => ({
            ...section,
            items: section.items.filter(item => 
                item.title.toLowerCase().includes(q) ||
                item.endpoint?.toLowerCase().includes(q) ||
                (typeof item.description === 'string' && item.description.toLowerCase().includes(q))
            )
        })).filter(section => section.items.length > 0);
    }, [filterQuery]);

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
            <aside className="w-full md:w-72 border-r border-border bg-surface/40 backdrop-blur-xl md:sticky md:top-0 md:h-screen overflow-y-auto shrink-0 z-20 custom-scrollbar">
                <div className="p-6 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold shadow-sm">
                            <Code2 size={18} />
                        </div>
                        <div>
                            <span className="font-extrabold text-base tracking-tight block text-foreground">API Reference</span>
                            <span className="text-[10px] text-muted font-mono uppercase tracking-widest">ApexKit 0.3.0</span>
                        </div>
                    </div>

                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Filter endpoints..."
                            value={filterQuery}
                            onChange={e => setFilterQuery(e.target.value)}
                            className="w-full pl-3 pr-8 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:ring-2 focus:ring-primary/40 outline-none transition-all placeholder:text-muted/60"
                        />
                    </div>

                    <nav className="space-y-1">
                        {filteredDocs.map(section => (
                            <button
                                key={section.id}
                                type="button"
                                onClick={() => scrollToSection(section.id)}
                                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all text-left cursor-pointer ${
                                    activeSection === section.id 
                                    ? 'bg-primary text-white shadow-md shadow-primary/20 font-bold' 
                                    : 'text-muted hover:bg-surface hover:text-foreground'
                                }`}
                            >
                                <section.icon size={15} className="shrink-0" />
                                <span className="truncate">{section.title}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            </aside>

            {/* --- CONTENT --- */}
            <main className="flex-1 min-w-0">
                <div className="max-w-5xl mx-auto p-6 md:p-12 pb-24 space-y-20">
                    
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase mb-4 shadow-sm">
                            <Sparkles size={14} className="text-amber-500" /> Unified TypeScript & REST API
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight text-foreground">
                            Developer Reference
                        </h1>
                        <p className="text-base sm:text-lg text-muted leading-relaxed max-w-3xl">
                            Explore the complete API surface. Every feature is available via the fully typed <strong><code className="text-primary font-mono">@apexkit/sdk</code></strong> library and standardized <strong>REST / HTTP</strong> endpoints.
                        </p>
                    </div>

                    <div className="space-y-24">
                        {filteredDocs.map(section => (
                            <section key={section.id} id={section.id} className="scroll-mt-24 space-y-10">
                                <div className="flex items-center gap-3 border-b border-border pb-4">
                                    <div className="p-2.5 bg-primary/10 rounded-xl text-primary border border-primary/20 shadow-sm">
                                        <section.icon size={22} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-foreground tracking-tight">{section.title}</h2>
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
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 bg-surface/20 border border-border/60 p-6 rounded-3xl shadow-sm hover:border-border transition-all">
            {/* Documentation Explanation */}
            <div className="xl:col-span-2 space-y-3.5 flex flex-col justify-between">
                <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        {item.method && (
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getMethodBadgeColor(item.method)}`}>
                                {item.method}
                            </span>
                        )}
                        <h3 className="text-base sm:text-lg font-bold text-foreground leading-tight">{item.title}</h3>
                    </div>
                    
                    {item.endpoint && (
                        <div className="font-mono text-[11px] bg-background border border-border px-2.5 py-1.5 rounded-lg text-primary break-all my-2">
                            {item.endpoint}
                        </div>
                    )}

                    <div className="text-xs sm:text-sm text-muted leading-relaxed font-sans pt-1">
                        {item.description}
                    </div>
                </div>

                <div className="text-[11px] text-muted flex items-center gap-2 pt-2 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Ready in <code className="text-foreground">@apexkit/sdk</code></span>
                </div>
            </div>

            {/* Code Preview */}
            <div className="xl:col-span-3">
                <div className="rounded-2xl border border-border bg-[#0d0d0d] overflow-hidden shadow-2xl">
                    {/* Toolbar */}
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-white/5">
                        <div className="flex gap-2">
                            <button 
                                type="button"
                                onClick={() => setLang('sdk')}
                                className={`text-xs font-bold px-3 py-1 rounded-lg transition-all cursor-pointer ${
                                    lang === 'sdk' 
                                        ? 'bg-primary text-white shadow-sm' 
                                        : 'text-zinc-400 hover:text-white'
                                }`}
                            >
                                TypeScript SDK
                            </button>
                            <button 
                                type="button"
                                onClick={() => setLang('curl')}
                                className={`text-xs font-bold px-3 py-1 rounded-lg transition-all cursor-pointer ${
                                    lang === 'curl' 
                                        ? 'bg-primary text-white shadow-sm' 
                                        : 'text-zinc-400 hover:text-white'
                                }`}
                            >
                                cURL / HTTP
                            </button>
                        </div>
                        <button 
                            type="button" 
                            onClick={handleCopy} 
                            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                            title="Copy code"
                        >
                            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        </button>
                    </div>

                    {/* Editor / Terminal Code Block */}
                    <div className="p-4 overflow-x-auto custom-scrollbar">
                        <pre className="text-xs font-mono text-emerald-300 leading-relaxed">
                            {code}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
}

function getMethodBadgeColor(method: string) {
    switch (method) {
        case 'GET': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
        case 'POST': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
        case 'PATCH': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
        case 'PUT': return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
        case 'DELETE': return 'bg-red-500/10 text-red-400 border-red-500/30';
        case 'WS': return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
        case 'SSE': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
        case 'GQL': return 'bg-pink-500/10 text-pink-400 border-pink-500/30';
        default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30';
    }
}