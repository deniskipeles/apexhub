# ⚡ ApexHub

> **The Official Developer Portal, Ecosystem & Documentation Hub for [ApexKit](https://github.com/deniskipeles/apexkit).**  
> *Powering the Extreme, Delivering the Excellent.*

ApexHub is a modern, high-performance web application designed to showcase, document, and manage the **ApexKit** runtime. It features a reactive client-side Single-Page Application (SPA) paired with a **Nitro** edge server engine that provides **dynamic SEO pre-rendering and on-the-fly OpenGraph image generation** for search engines and social platforms.

---

## 🏗️ Architectural Overview

ApexHub operates on a hybrid architecture combining client-side speed with complete search engine indexability:

```
                          ┌──────────────────────────┐
                          │   Incoming HTTP Client   │
                          └─────────────┬────────────┘
                                        │
                         [ Nitro Edge / Cloudflare ]
                         (crawler-detector middleware)
                                        │
                 ┌──────────────────────┴──────────────────────┐
                 │                                             │
          [ Human Browser ]                             [ Bot / Crawler ]
                 │                             (Googlebot, Twitterbot, Discord, etc.)
                 ▼                                             │
      ┌─────────────────────┐                                  ▼
      │   Vite React 19 SPA │                     ┌─────────────────────────┐
      │ (dist-client bundle)│                     │   GET /api/v1/webhook/  │
      │  Zustand Router     │                     │       seo-crawler       │
      └─────────────────────┘                     └────────────┬────────────┘
                 │                                             │
                 │                                  [ ApexKit QuickJS / Hono ]
                 │                                  (Oxc JSX Transpiler Engine)
                 │                                             │
                 │                                ┌────────────┴────────────┐
                 │                                │                         │
                 │                         (Accept: HTML)             (Accept: Image / ?raw=1)
                 │                                │                         │
                 ▼                                ▼                         ▼
     ┌──────────────────────┐        ┌─────────────────────────┐   ┌───────────────────────┐
     │  ApexKit Backend API │        │ Semantic Hono JSX HTML  │   │ Vector OpenGraph Card │
     │  Multi-DB SQLite     │        │ - Crawlable Sitemap     │   │ - Resvg / Tiny-Skia   │
     │  HNSW Vector Search  │        │ - JSON-LD Structured    │   │ - WebP $fs Cached     │
     │  Tantivy Instant FTS │        │ - Paginated Directory   │   │ - 1200x630 Resolution │
     └──────────────────────┘        └─────────────────────────┘   └───────────────────────┘
```

1. **Human Visitors:** Served a responsive, dark-mode client-side SPA with near-instant client-side routing, code editors, real-time WebSocket interactions, and dynamic SVG favicon branding.
2. **Web Crawlers & Social Bots:** Intercepted by Nitro server middleware and served semantic **Hono JSX HTML snapshots** containing metadata, JSON-LD schemas, breadcrumbs, and deep pagination links (`rel="prev"` / `rel="next"`).
3. **Social Share Previews:** Generates branded 1200×630 WebP cards on demand using ApexKit’s embedded vector rasterizer with disk-level caching.

---

## ✨ Features

- **📖 Complete Documentation & Knowledge Base:** Multi-category technical guides with embedded syntax highlighting and semantic search powered by Tantivy and vector embeddings.
- **🛠️ Interactive API Reference:** Interactive, typed documentation for `@apexkit/sdk` covering REST endpoints, GraphQL dynamic schemas, Tus 1.0.0 resumable uploads, and WebSocket streams.
- **⚡ Performance Benchmarks & Optimizations:** Community-submitted SQLite PRAGMA formulas, memory tuning strategies, and real-time upvoting over WebSockets.
- **🧩 Ecosystem Registry:** Starter templates, zero-build serverless TypeScript webhooks, custom modules, and community project showcases.
- **🧪 Ephemeral Sandboxes & Multi-Tenancy:** Automated provisioning of physically isolated SQLite databases (`tenant:*` and `sandbox:*`) with custom quotas and live dashboard embedding.
- **📰 Engineering Blog & Changelog:** In-depth technical articles, release version history, and roadmap quarters pulled directly from database collections.
- **📥 Binary Downloads:** Automatic resolution of platform binaries (Linux x86_64/ARM64, macOS Universal, Windows x64) directly from GitHub Releases with SHA-256 verification checksums.

---

## 📂 Project Structure

```
apexhub/
├── apexkit_assets/             # Backend Assets, Webhooks & Schemas (Synced to ApexKit)
│   ├── ai_actions/             # Prompt templates and streaming AI action configs
│   ├── modules/custom/         # Reusable QuickJS backend modules
│   │   ├── bot-views.tsx       # Semantic Hono JSX layouts and sitemaps for bots
│   │   ├── og-generator.js     # SVG vector renderer and WebP cache manager
│   │   └── seo-resolver.js     # Live database query resolver with pagination
│   ├── schemas/
│   │   └── apex_schema.json    # Complete schema definition for collections
│   ├── webhooks/               # Zero-build Hono serverless endpoints
│   │   ├── api-community.js    # Community threads, items, and tenancy offers
│   │   ├── api-docs.js         # Single-trip document resolver
│   │   ├── api-downloads.js    # GitHub Release proxy and asset selector
│   │   ├── api-scope-util.js   # Ephemeral sandbox and tenant provisioning
│   │   └── seo-crawler.tsx     # JSX Edge crawler handler & OpenGraph endpoint
│   ├── apexkit-watch.js        # ApexKit Developer Tools & live file sync client
│   └── package.json            # Workspace tooling dependencies
│
└── vite/                       # Frontend SPA + Nitro Production Server
    ├── public/                 # Static assets, favicon, and redirects
    ├── server/                 # Nitro server engine
    │   ├── middleware/         # Edge crawler detection (BOT_REGEX)
    │   └── routes/             # SPA fallback wildcard router ([...slug].ts)
    ├── src/                    # React 19 Frontend Application
    │   ├── components/         # Modular UI views (Docs, Blog, Optimizations, etc.)
    │   ├── lib/                # ApexKit SDK client instance and Markdown helpers
    │   ├── pages/              # Lazy-loaded route views
    │   ├── store/              # Zustand state stores (Router, Auth, Theme)
    │   └── App.tsx             # Root layout and view switchboard
    ├── nitro.config.ts         # Nitro server, caching, and publicAsset config
    ├── vite.config.ts          # Vite 6 config with Tailwind CSS v4 & code-splitting
    └── package.json            # Scripts & dependencies
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js:** v20.x or later
- **npm** or **pnpm**
- **ApexKit Instance:** Running locally on port `5000` or deployed remotely

---

### 1. Environment Configuration

Create a `.env` file inside `apexhub/vite/`:

```env
# ApexKit Backend API URL (Root instance)
VITE_API_URL=http://localhost:5000

# Optional: Scoped Tenant ID (leave blank for root hub)
VITE_TENANT_ID=

# GitHub Token (Optional: Increases rate limit for release binary downloads)
GITHUB_TOKEN=
```

Create a `.env` file inside `apexhub/apexkit_assets/`:

```env
APEXKIT_URL=http://localhost:5000
APEXKIT_API_KEY=root_sys_prod_your_api_key_here
SCOPE_KEY=root
```

---

### 2. Install Dependencies

```bash
# Install frontend & server dependencies
cd apexhub/vite
npm install

# Install backend sync tooling
cd ../apexkit_assets
npm install
```

---

### 3. Synchronize Backend Webhooks & Schemas

ApexHub requires its custom webhooks and schemas to be pushed to the ApexKit server. Use the `apexkit-watch.js` CLI:

```bash
cd apexhub/apexkit_assets

# Push all serverless webhooks, custom modules, and templates to ApexKit
node apexkit-watch.js push --all

# (Optional) Start the live development watcher for auto-sync on save
node apexkit-watch.js
```

---

### 4. Run Development Server

To run the Vite development server with HMR:

```bash
cd apexhub/vite
npm run dev
```

Visit **`http://localhost:3000`** in your browser.

---

## 📦 Production Build & Deployment

ApexHub uses a two-stage build pipeline:
1. **Vite:** Compiles the React 19 application into `dist-client/` with gzip pre-compression and vendor code-splitting.
2. **Nitro:** Compiles the universal server engine into `.output/server/index.mjs` and bundles public static assets.

```bash
cd apexhub/vite
npm run build
```

### Local Production Preview

```bash
npm run preview
```
Runs the compiled standalone production server on `http://localhost:3000`.

---

### Deploying to Cloudflare Pages (Wrangler)

ApexHub includes an automated Nitro hook in `nitro.config.ts` that removes `.output/public/index.html` post-compilation. This ensures that Cloudflare Pages routes the root `/` path through the Worker function for crawler detection, while static assets in `/assets/**` are served directly by the Cloudflare CDN with immutable cache headers.

```bash
cd apexhub/vite

# 1. Build client and server bundles
npm run build

# 2. Test locally using Wrangler
npx wrangler pages dev dist-client --port 8788

# 3. Deploy to Cloudflare Pages
npx wrangler pages deploy dist-client --project-name apexhub
```

---

## 🧪 Testing Crawlers & OpenGraph Previews

You can verify that the edge crawler detector and Hono JSX render engine are functioning using `curl`:

### 1. Test Bot Emulation on a Dynamic Sub-page
```bash
curl -A "Twitterbot/1.0" "http://localhost:8788/docs/quick_dev"
```
*Expected Output:* An HTML5 document with complete `<title>`, OpenGraph meta tags, JSON-LD schema, breadcrumbs, and article content.

### 2. Test Dynamic Discovery & Crawling on the Home Page
```bash
curl -A "Googlebot/2.1" "http://localhost:8788/?bot=1"
```
*Expected Output:* Pre-rendered document containing deep links to documentation guides, recent engineering blogs, optimization strategies, and the sitemap.

### 3. Test Paginated Directory Crawling
```bash
curl -A "Googlebot/2.1" "http://localhost:8788/docs?page=2"
```
*Expected Output:* Page 2 of the documentation library with `<link rel="prev">` and `<link rel="next">` tags.

### 4. Test Direct OpenGraph Image Generation
```bash
curl -I "http://localhost:5000/api/v1/webhook/seo-crawler?path=/features&raw=1"
```
*Expected Output:*
```http
HTTP/1.1 200 OK
content-type: image/webp
content-length: 32502
cache-control: public, max-age=86400, immutable
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 19, TypeScript, Vite 6 |
| **Styling** | Tailwind CSS v4, Lucide Icons |
| **State & Routing** | Zustand (Client-side custom router & session stores) |
| **Markdown Engine** | Marked, DOMPurify, Highlight.js |
| **Server Engine** | Nitro (`nitropack` v2.13), H3, Edge Middlewares |
| **Crawler Templating**| Hono v4 (Native Edge JSX via `@jsxImportSource https://esm.sh/hono/jsx`) |
| **Backend Runtime** | ApexKit v0.3.0 (Rust, Multi-DB SQLite, QuickJS, Tantivy, Candle/ONNX) |

---

## 📄 License

ApexHub is open-source software licensed under the [MIT License](LICENSE).
