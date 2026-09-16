/** @type {import("../apexkit").FileMetadata} */
export const __fileMetadata__ = {
  "id": 105,
  "name": "seo-crawler",
  "extension": "js",
  "target_collection": null,
  "type": "webhook",
  "path": "./webhooks/",
  "trigger_type": "manual",
  "active": true,
  "visibility": "public"
};

/** @jsxImportSource https://esm.sh/hono/jsx */
import { Hono } from "https://esm.sh/hono";
import { generateApexOgImage } from "@/custom/og-generator.js";
import { resolveSeoMetadata } from "@/custom/seo-resolver.js";
import { BotHtmlDocument } from "@/custom/bot-views.js";

const app = new Hono();

async function resolveUrls() {
  let appUrl = "";
  try {
    appUrl = await $env.get("APP_URL");
  } catch (_) {}
  if (!appUrl) {
    try {
      appUrl = await $env.get("BASE_URL");
    } catch (_) {}
  }
  if (!appUrl) {
    appUrl = $env.APP_URL || $env.BASE_URL || "http://127.0.0.1:5000";
  }
  const baseUrl = appUrl.replace(/\/$/, "");
  return { baseUrl, logoUrl: `${baseUrl}/logo` };
}

const SITE_NAVIGATION = [
  {
    category: "Architecture & Engine",
    links: [
      { label: "Platform Features", path: "/features", desc: "Multi-DB SQLite, Dual Vector Engine (BERT/SigLIP), and QuickJS TypeScript." },
      { label: "API Reference", path: "/api-reference", desc: "Full SDK methods, REST endpoints, and Tus 1.0.0 upload specifications." },
      { label: "Performance Tuning", path: "/optimizations", desc: "Community-driven PRAGMA memory optimizations and WAL benchmarks." },
      { label: "Binary Download", path: "/download", desc: "Download standalone Linux, macOS, and Windows runtime executables." },
    ],
  },
  {
    category: "Documentation & Ecosystem",
    links: [
      { label: "Docs Knowledge Base", path: "/docs", desc: "Getting started guides, single-binary deployments, and architecture manuals." },
      { label: "Community Ecosystem", path: "/ecosystem", desc: "Starters, serverless TypeScript webhooks, and instance hosting market." },
      { label: "Engineering Blog", path: "/blog", desc: "Deep dives into vertical scaling, database changesets, and Rust performance." },
      { label: "The Apex Manifesto", path: "/about", desc: "Why vertical scaling collapses modern cloud microservice complexity." },
    ],
  },
  {
    category: "Project Activity & Vision",
    links: [
      { label: "Product Roadmap", path: "/roadmap", desc: "Active development timeline and quarterly engineering milestones." },
      { label: "Version Changelog", path: "/changelog", desc: "Release notes, bug fixes, and feature additions across versions." },
      { label: "Careers & Openings", path: "/careers", desc: "Join the core development team or post ecosystem opportunities." },
      { label: "Sandbox Registry", path: "/help", desc: "Inspect and prototype in isolated 5ms ephemeral SQLite environments." },
    ],
  },
];

app.all("*", async (c) => {
  const reqPath = c.req.query("path") || "/";
  const pageUrl = c.req.query("url") || reqPath;
  const isRawImage = c.req.query("raw") === "1" || c.req.header("accept")?.includes("image/");

  // Pass full query object (including ?page=2, etc.) to resolver
  const meta = await resolveSeoMetadata(reqPath, c.req.query());
  const { baseUrl, logoUrl } = await resolveUrls();

  // 1. Raw WebP Image Request
  if (isRawImage) {
    try {
      const image = await generateApexOgImage({
        category: meta.category,
        title: meta.title,
        description: meta.description,
        badge: meta.badge,
        accentColor: meta.accentColor,
        tags: meta.tags,
        codeSnippet: meta.codeSnippet,
        forceFresh: c.req.query("force") === "1",
      });

      return new Response(image.buffer, {
        status: 200,
        headers: {
          "Content-Type": "image/webp",
          "Content-Length": String(image.buffer.byteLength || image.buffer.length),
          "Cache-Control": "public, max-age=86400, immutable",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (err: any) {
      return c.text(`OpenGraph render error: ${err.message}`, 500);
    }
  }

  // 2. Render Semantic Hono JSX Page with dynamic sub-page links & pagination
  const ogImageUrl = `${baseUrl}/api/v1/webhook/seo-crawler?path=${encodeURIComponent(reqPath)}&raw=1`;

  return c.html(
    <BotHtmlDocument
      meta={meta}
      ogImageUrl={ogImageUrl}
      pageUrl={pageUrl}
      logoUrl={logoUrl}
      siteNavigation={SITE_NAVIGATION}
    />,
    200,
    {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    }
  );
});

export default async function (req: Request) {
  return app.fetch(req);
}