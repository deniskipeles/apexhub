/** @type {import("../../apexkit").FileMetadata} */
export const __fileMetadata__ = {
  "id": 111,
  "name": "seo-resolver",
  "extension": "js",
  "target_collection": null,
  "type": "custom:module",
  "path": "./modules/custom/",
  "trigger_type": "manual",
  "active": true,
  "visibility": "private"
};

function cleanSnippet(text = "", maxLen = 160) {
  const clean = String(text || "")
    .replace(/<[^>]*>?/gm, "")
    .replace(/#+/g, "")
    .replace(/[*_`~[\]()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return clean.length > maxLen ? clean.slice(0, maxLen - 3) + "..." : clean;
}

export async function resolveSeoMetadata(reqPath = "/", queryParams = {}) {
  const cleanPath = (reqPath || "/").split("?")[0].replace(/\/$/, "") || "/";
  const segments = cleanPath.split("/").filter(Boolean);
  const page = Math.max(1, parseInt(queryParams.page || "1", 10));

  // =========================================================================
  // 1. HOME PAGE: Crawlable hub with live docs, blogs, optimizations & links
  // =========================================================================
  if (cleanPath === "/") {
    const [docsRes, blogRes, optRes] = await Promise.all([
      $db.records.list("docs", { limit: 12, sort: "title" }).catch(() => ({ items: [], total: 0 })),
      $db.records.list("blog", { limit: 6, sort: "-created" }).catch(() => ({ items: [], total: 0 })),
      $db.records.list("optimizations", { limit: 6, sort: "-upvotes" }).catch(() => ({ items: [], total: 0 }))
    ]);

    const liveDocs = (docsRes.items || []).map(d => ({
      title: d.data?.title || "Guide",
      path: `/docs/${d.data?.slug || d.id}`,
      category: d.data?.category || "Documentation",
      desc: cleanSnippet(d.data?.content, 120)
    }));

    const liveBlogs = (blogRes.items || []).map(b => ({
      title: b.data?.headline || "Blog Post",
      path: `/blog/${b.id}`,
      category: "ENGINEERING BLOG",
      desc: cleanSnippet(b.data?.subheadline || b.data?.body, 120)
    }));

    const liveOptimizations = (optRes.items || []).map(o => ({
      title: o.data?.title || "Tuning Formula",
      path: `/optimizations/${o.id}`,
      category: "BENCHMARK",
      desc: cleanSnippet(o.data?.content, 120)
    }));

    return {
      title: "ApexKit Hub — Extreme & Excellent Backend Platform",
      description: "Collapse cloud complexity into a single, high-performance Rust binary runtime with multi-DB SQLite, in-memory HNSW vector search, and zero-build TypeScript.",
      category: "RUNTIME PLATFORM",
      badge: "v0.3.0",
      accentColor: "#6366f1",
      tags: ["Rust", "SQLite", "AI Vectors", "Hono"],
      breadcrumbs: [{ label: "Home", path: "/" }],
      isHome: true,
      highlights: [
        "Sub-5ms cold starts with zero external microservice dependencies",
        "Multi-database SQLite architecture with zero-copy JSONB engine",
        "Embedded Tantivy full-text search engine with typo-tolerance",
        "Active-active distributed master-replica SQLite changeset replication"
      ],
      codeSnippet: `import { ApexKit } from '@apexkit/sdk';\nconst apex = new ApexKit('https://api.apexkit.io');\nconst hits = await apex.collection('docs').searchVectorWithText('replication');`,
      homeSections: {
        docs: { title: "Documentation Library", total: docsRes.total, items: liveDocs, allPath: "/docs" },
        blog: { title: "Engineering Insights", total: blogRes.total, items: liveBlogs, allPath: "/blog" },
        optimizations: { title: "Performance Benchmarks", total: optRes.total, items: liveOptimizations, allPath: "/optimizations" }
      }
    };
  }

  // =========================================================================
  // 2. DOCUMENTATION (Paginated List & Detail)
  // =========================================================================
  if (segments[0] === "docs") {
    const slug = segments[1];
    if (slug && slug !== "new") {
      let doc = null;
      try {
        const res = await $db.records.list("docs", {
          filter: JSON.stringify({ slug }),
          limit: 1
        }).catch(() => ({ items: [] }));

        if (res.items && res.items.length > 0) {
          doc = res.items[0].data;
        } else {
          const direct = await $db.records.get("docs", slug).catch(() => null);
          if (direct) doc = direct.data;
        }
      } catch (_) {}

      const title = doc ? doc.title : "Documentation Guide";
      const content = doc ? doc.content : "";

      return {
        title: `${title} — ApexKit Docs`,
        description: cleanSnippet(content, 160) || "Official ApexKit documentation guide.",
        category: (doc?.category || "DOCS").toUpperCase(),
        badge: "GUIDE",
        accentColor: "#38bdf8",
        tags: ["Docs", doc?.category || "Guide", "ApexKit"],
        breadcrumbs: [
          { label: "Home", path: "/" },
          { label: "Docs", path: "/docs" },
          { label: title, path: cleanPath }
        ],
        bodyContent: content,
        codeSnippet: content.includes("```") ? content.split("```")[1]?.trim() : ""
      };
    }

    // Paginated Documentation Index
    const perPage = 10;
    const docsRes = await $db.records.list("docs", {
      page,
      per_page: perPage,
      sort: "title"
    }).catch(() => ({ items: [], total: 0 }));

    const total = docsRes.total || (docsRes.items || []).length;
    const items = (docsRes.items || []).map(d => ({
      title: d.data?.title || "Guide",
      path: `/docs/${d.data?.slug || d.id}`,
      badge: d.data?.category || "Guide",
      desc: cleanSnippet(d.data?.content, 180)
    }));

    return {
      title: `Documentation & Guides (Page ${page}) — ApexKit Hub`,
      description: `Browse official ApexKit guides, quickstart tutorials, and architectural patterns (Page ${page} of ${Math.ceil(total / perPage)}).`,
      category: "DOCUMENTATION",
      badge: `PAGE ${page}`,
      accentColor: "#38bdf8",
      breadcrumbs: [{ label: "Home", path: "/" }, { label: "Docs", path: "/docs" }],
      paginatedList: {
        items,
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
        basePath: "/docs"
      }
    };
  }

  // =========================================================================
  // 3. BLOG (Paginated List & Detail)
  // =========================================================================
  if (segments[0] === "blog") {
    const id = segments[1];
    if (id && id !== "new") {
      let post = null;
      try {
        const direct = await $db.records.get("blog", id).catch(() => null);
        if (direct) post = direct.data;
      } catch (_) {}

      const title = post ? post.headline : "Engineering Post";
      return {
        title: `${title} — ApexKit Blog`,
        description: cleanSnippet(post?.subheadline || post?.body, 160),
        category: "ENGINEERING BLOG",
        badge: post?.read_time || "5 min read",
        accentColor: "#f59e0b",
        tags: Array.isArray(post?.tags) ? post.tags : ["Engineering"],
        breadcrumbs: [
          { label: "Home", path: "/" },
          { label: "Blog", path: "/blog" },
          { label: title, path: cleanPath }
        ],
        bodyContent: post?.body || ""
      };
    }

    const perPage = 8;
    const blogRes = await $db.records.list("blog", {
      page,
      per_page: perPage,
      sort: "-created"
    }).catch(() => ({ items: [], total: 0 }));

    const total = blogRes.total || (blogRes.items || []).length;
    const items = (blogRes.items || []).map(b => ({
      title: b.data?.headline || "Blog Post",
      path: `/blog/${b.id}`,
      badge: b.data?.read_time || "Article",
      desc: cleanSnippet(b.data?.subheadline || b.data?.body, 180)
    }));

    return {
      title: `Engineering Blog (Page ${page}) — ApexKit Hub`,
      description: `Technical deep dives into database internals, Rust optimizations, and vertical scaling benchmarks (Page ${page}).`,
      category: "ENGINEERING BLOG",
      badge: `PAGE ${page}`,
      accentColor: "#f59e0b",
      breadcrumbs: [{ label: "Home", path: "/" }, { label: "Blog", path: "/blog" }],
      paginatedList: {
        items,
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
        basePath: "/blog"
      }
    };
  }

  // =========================================================================
  // 4. OPTIMIZATIONS (Paginated List & Detail)
  // =========================================================================
  if (segments[0] === "optimizations") {
    const id = segments[1];
    if (id) {
      let opt = null;
      try {
        const direct = await $db.records.get("optimizations", id).catch(() => null);
        if (direct) opt = direct.data;
      } catch (_) {}

      const title = opt ? opt.title : "Tuning Strategy";
      return {
        title: `${title} — ApexKit Optimizations`,
        description: cleanSnippet(opt?.content, 160) || "Community architectural tuning formula.",
        category: "OPTIMIZATION",
        badge: `▲ ${opt?.upvotes || 0} VOTES`,
        accentColor: "#10b981",
        tags: Array.isArray(opt?.tags) ? opt.tags : ["Performance", "Tuning"],
        breadcrumbs: [
          { label: "Home", path: "/" },
          { label: "Optimizations", path: "/optimizations" },
          { label: title, path: cleanPath }
        ],
        bodyContent: opt?.content || ""
      };
    }

    const perPage = 8;
    const optRes = await $db.records.list("optimizations", {
      page,
      per_page: perPage,
      sort: "-upvotes"
    }).catch(() => ({ items: [], total: 0 }));

    const total = optRes.total || (optRes.items || []).length;
    const items = (optRes.items || []).map(o => ({
      title: o.data?.title || "Tuning Strategy",
      path: `/optimizations/${o.id}`,
      badge: `▲ ${o.data?.upvotes || 0} votes`,
      desc: cleanSnippet(o.data?.content, 180)
    }));

    return {
      title: `Optimization Benchmarks (Page ${page}) — ApexKit Hub`,
      description: `Community-driven PRAGMA configurations, memory formulas, and vector tuning strategies (Page ${page}).`,
      category: "BENCHMARKS",
      badge: `PAGE ${page}`,
      accentColor: "#10b981",
      breadcrumbs: [{ label: "Home", path: "/" }, { label: "Optimizations", path: "/optimizations" }],
      paginatedList: {
        items,
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
        basePath: "/optimizations"
      }
    };
  }

  // =========================================================================
  // 5. FEATURES, API REFERENCE, DOWNLOAD, ROADMAP, CHANGELOG, ABOUT
  // =========================================================================
  if (cleanPath === "/features") {
    return {
      title: "Architectural Pillars & Capabilities — ApexKit Hub",
      description: "Deep dive into multi-database SQLite, in-memory HNSW vector embeddings, QuickJS TypeScript sandbox, Tantivy search, and distributed replication.",
      category: "ARCHITECTURE",
      badge: "CORE ENGINE",
      accentColor: "#10b981",
      tags: ["Multi-DB", "Candle", "ONNX", "QuickJS"],
      breadcrumbs: [{ label: "Home", path: "/" }, { label: "Features", path: "/features" }],
      highlights: [
        "Distributed SQLite: core.db, data.db, vectors.db, system.db",
        "Dual Vector Engine: BERT, Gemma-300M, Qwen3, SigLIP2, CLIP",
        "Zero-Build TypeScript transpiled on-the-fly via Oxc",
        "42+ Lifecycle Event Hooks and serverless TypeScript webhooks"
      ]
    };
  }

  if (cleanPath === "/api-reference") {
    return {
      title: "Developer API & TypeScript SDK Reference — ApexKit Hub",
      description: "Complete API specification for @apexkit/sdk and standardized REST endpoints across auth, collections, vector search, Tus uploads, and admin.",
      category: "API REFERENCE",
      badge: "@apexkit/sdk",
      accentColor: "#3b82f6",
      tags: ["REST", "TypeScript", "GraphQL", "WebSocket"],
      breadcrumbs: [{ label: "Home", path: "/" }, { label: "API Reference", path: "/api-reference" }],
      highlights: [
        "Multi-tenancy and sandbox client scoping",
        "Tus 1.0.0 resumable multipart chunked file uploads",
        "Real-time WebSocket event streams and instant search",
        "Fast-fail composite API keys with tenant scoping"
      ]
    };
  }

  if (cleanPath === "/download" || cleanPath === "/downloads") {
    return {
      title: "Install & Download ApexKit Standalone Binary",
      description: "Download single-binary compiled executables for Linux (x86_64, aarch64), macOS (Apple Silicon, Intel), and Windows with zero external dependencies.",
      category: "DOWNLOAD",
      badge: "v0.3.0",
      accentColor: "#6366f1",
      tags: ["Linux", "macOS", "Windows", "Binary"],
      breadcrumbs: [{ label: "Home", path: "/" }, { label: "Download", path: "/download" }],
      codeSnippet: "curl -fsSL https://api.apexkit.io/api/v1/run/get-install-script | sh"
    };
  }

  if (cleanPath === "/roadmap") {
    const roadmapRes = await $db.records.list("roadmap", { limit: 50, sort: "quarter" }).catch(() => ({ items: [] }));
    const items = (roadmapRes.items || []).map(r => ({
      title: `${r.data?.quarter || 'Milestone'}: ${r.data?.headline}`,
      path: "/roadmap",
      badge: r.data?.status?.toUpperCase() || "PLANNED",
      desc: cleanSnippet(r.data?.description, 150)
    }));

    return {
      title: "Product Roadmap & Timeline — ApexKit Hub",
      description: "Transparent development milestones and engineering roadmap prioritized by community feedback.",
      category: "PRODUCT VISION",
      badge: "ROADMAP",
      accentColor: "#eab308",
      breadcrumbs: [{ label: "Home", path: "/" }, { label: "Roadmap", path: "/roadmap" }],
      paginatedList: { items, page: 1, perPage: 50, total: items.length, totalPages: 1, basePath: "/roadmap" }
    };
  }

  if (cleanPath === "/changelog") {
    const changeRes = await $db.records.list("changelog", { limit: 50, sort: "-release_date" }).catch(() => ({ items: [] }));
    const items = (changeRes.items || []).map(c => ({
      title: `Release ${c.data?.version || 'Update'} (${new Date(c.data?.release_date || c.created).toLocaleDateString()})`,
      path: "/changelog",
      badge: c.data?.is_latest ? "LATEST" : "RELEASE",
      desc: cleanSnippet(c.data?.body, 150)
    }));

    return {
      title: "Release Changelog & Updates — ApexKit Hub",
      description: "Official release notes, fixes, and feature updates across ApexKit versions.",
      category: "CHANGELOG",
      badge: "RELEASES",
      accentColor: "#f43f5e",
      breadcrumbs: [{ label: "Home", path: "/" }, { label: "Changelog", path: "/changelog" }],
      paginatedList: { items, page: 1, perPage: 50, total: items.length, totalPages: 1, basePath: "/changelog" }
    };
  }

  // Fallback
  return {
    title: "ApexKit Hub — Extreme & Excellent Backend Platform",
    description: "The specialized toolkit designed to collapse the complexity of the modern cloud into a single, high-performance runtime.",
    category: "APEXKIT RUNTIME",
    badge: "v0.3.0",
    accentColor: "#6366f1",
    tags: ["Rust", "SQLite", "AI Vectors", "WebSockets"],
    breadcrumbs: [{ label: "Home", path: "/" }]
  };
}