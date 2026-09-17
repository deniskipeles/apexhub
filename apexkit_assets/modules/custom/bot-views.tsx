/** @type {import("../../apexkit").FileMetadata} */
export const __fileMetadata__ = {
  "id": 108,
  "name": "bot-views",
  "extension": "tsx",
  "target_collection": null,
  "type": "custom:module",
  "path": "./modules/custom/",
  "trigger_type": "manual",
  "active": true,
  "visibility": "private"
};

/** @jsxImportSource https://esm.sh/hono/jsx */

export interface BotProps {
  meta: any;
  ogImageUrl: string;
  pageUrl: string;
  logoUrl: string;
  siteNavigation: Array<{
    category: string;
    links: Array<{ label: string; path: string; desc: string }>;
  }>;
}

export const BotHtmlDocument = ({ meta, ogImageUrl, pageUrl, logoUrl, siteNavigation }: BotProps) => {
  const breadcrumbs = meta.breadcrumbs || [{ label: "Home", path: "/" }];
  const paginatedList = meta.paginatedList;
  const homeSections = meta.homeSections;

  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
        <link rel="canonical" href={pageUrl} />

        {/* Pagination SEO links for search engines */}
        {paginatedList && paginatedList.page > 1 && (
          <link rel="prev" href={`${paginatedList.basePath}?page=${paginatedList.page - 1}`} />
        )}
        {paginatedList && paginatedList.page < paginatedList.totalPages && (
          <link rel="next" href={`${paginatedList.basePath}?page=${paginatedList.page + 1}`} />
        )}

        {/* OpenGraph & Twitter Cards */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="ApexKit Hub" />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:type" content="image/webp" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={meta.title} />
        <meta name="twitter:description" content={meta.description} />
        <meta name="twitter:image" content={ogImageUrl} />

        <link rel="icon" type="image/svg+xml" href={logoUrl} />

        <style dangerouslySetInnerHTML={{ __html: `
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #090d16; color: #f1f5f9; margin: 0; padding: 2rem 1.5rem; line-height: 1.6; }
          .container { max-width: 900px; margin: 0 auto; }
          .badge { display: inline-block; font-size: 11px; font-weight: bold; text-transform: uppercase; padding: 4px 12px; border-radius: 999px; background: rgba(99, 102, 241, 0.15); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.3); margin-bottom: 1rem; }
          h1 { font-size: 2.25rem; font-weight: 800; line-height: 1.2; margin: 0 0 1rem 0; color: #ffffff; }
          p.lead { font-size: 1.15rem; color: #94a3b8; margin-bottom: 2rem; }
          .card { background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; padding: 1.5rem; margin-bottom: 1.5rem; }
          pre { background: #05080e; padding: 1rem; border-radius: 8px; overflow-x: auto; font-family: monospace; font-size: 13px; color: #a5b4fc; }
          .item-row { border-bottom: 1px solid #1e293b; padding: 1rem 0; }
          .item-row:last-child { border-bottom: none; }
          .item-title { font-size: 1.15rem; font-weight: 700; color: #818cf8; text-decoration: none; display: block; margin-bottom: 0.25rem; }
          .item-title:hover { text-decoration: underline; }
          .pagination { display: flex; gap: 0.5rem; align-items: center; justify-content: center; margin: 2rem 0; font-family: monospace; }
          .page-link { padding: 6px 12px; background: #0f172a; border: 1px solid #1e293b; color: #f1f5f9; text-decoration: none; border-radius: 8px; font-size: 12px; }
          .page-link.active { background: #6366f1; border-color: #6366f1; font-weight: bold; }
          .nav-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; margin-top: 1rem; }
          .nav-item { background: #090d16; border: 1px solid #1e293b; border-radius: 12px; padding: 1rem; text-decoration: none; display: block; }
          .nav-title { color: #818cf8; font-weight: bold; font-size: 14px; margin-bottom: 0.25rem; display: block; }
          .nav-desc { color: #64748b; font-size: 12px; line-height: 1.4; display: block; }
          .cta-btn { display: inline-block; background: #6366f1; color: #ffffff; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 12px; margin-top: 1rem; }
        `}} />
      </head>
      <body>
        <div class="container">
          <nav style="font-size: 12px; color: #64748b; margin-bottom: 1.5rem;" aria-label="Breadcrumb">
            {breadcrumbs.map((b: any, i: number) => (
              <span key={b.path}>
                {i > 0 && " / "}
                <a href={b.path} style="color: #818cf8; text-decoration: none;">{b.label}</a>
              </span>
            ))}
          </nav>

          <main>
            <span class="badge">{meta.category || "APEXKIT PLATFORM"}</span>
            <h1>{meta.title}</h1>
            <p class="lead">{meta.description}</p>

            {/* Highlights */}
            {meta.highlights && meta.highlights.length > 0 && (
              <div class="card">
                <h3 style="margin-top: 0; font-size: 16px; color: #e2e8f0;">Key Capabilities</h3>
                <ul style="padding-left: 1.25rem; color: #cbd5e1; margin: 0;">
                  {meta.highlights.map((h: string, i: number) => (
                    <li key={i} style="margin-bottom: 0.5rem;">{h}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Single Guide/Article Content */}
            {meta.bodyContent && (
              <div class="card">
                <div style="white-space: pre-wrap; font-size: 14px; color: #cbd5e1; line-height: 1.7;">
                  {meta.bodyContent.slice(0, 3000)}
                </div>
              </div>
            )}

            {/* Code Reference Preview */}
            {meta.codeSnippet && (
              <div class="card">
                <h3 style="margin-top: 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; font-family: monospace;">CLI / Code Reference</h3>
                <pre><code>{meta.codeSnippet}</code></pre>
              </div>
            )}

            {/* Paginated Content Listing (For /docs, /blog, /optimizations) */}
            {paginatedList && (
              <section class="card" aria-label="Content Directory">
                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 1rem;">
                  <h2 style="margin: 0; font-size: 18px; color: #ffffff;">Available Entries</h2>
                  <span style="font-size: 12px; color: #64748b; font-family: monospace;">
                    Showing Page {paginatedList.page} of {paginatedList.totalPages} ({paginatedList.total} items)
                  </span>
                </div>

                <div>
                  {paginatedList.items.map((item: any) => (
                    <article key={item.path} class="item-row">
                      <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
                        <a href={item.path} class="item-title">{item.title}</a>
                        {item.badge && (
                          <span style="font-size: 10px; font-family: monospace; background: rgba(99, 102, 241, 0.15); color: #818cf8; padding: 2px 8px; border-radius: 4px;">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p style="margin: 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">{item.desc}</p>
                    </article>
                  ))}
                </div>

                {/* Search Engine Crawlable Pagination Navigation */}
                {paginatedList.totalPages > 1 && (
                  <nav class="pagination" aria-label="Pagination Navigation">
                    {paginatedList.page > 1 && (
                      <a href={`${paginatedList.basePath}?page=${paginatedList.page - 1}`} class="page-link" rel="prev">
                        &larr; Prev
                      </a>
                    )}
                    
                    {Array.from({ length: paginatedList.totalPages }).map((_, idx) => {
                      const p = idx + 1;
                      return (
                        <a 
                          key={p} 
                          href={`${paginatedList.basePath}?page=${p}`} 
                          class={`page-link ${p === paginatedList.page ? 'active' : ''}`}
                        >
                          {p}
                        </a>
                      );
                    })}

                    {paginatedList.page < paginatedList.totalPages && (
                      <a href={`${paginatedList.basePath}?page=${paginatedList.page + 1}`} class="page-link" rel="next">
                        Next &rarr;
                      </a>
                    )}
                  </nav>
                )}
              </section>
            )}

            {/* HOME PAGE SPECIFIC: Direct Discovery Sections for Spiders */}
            {homeSections && (
              <div style="space-y: 1.5rem;">
                {/* 1. Documentation Links */}
                {homeSections.docs.items.length > 0 && (
                  <section class="card" aria-label="Documentation Library">
                    <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.5rem;">
                      <h2 style="font-size: 18px; margin: 0; color: #ffffff;">{homeSections.docs.title}</h2>
                      <a href={homeSections.docs.allPath} style="font-size: 12px; color: #818cf8; text-decoration: none; font-weight: bold;">
                        Browse All {homeSections.docs.total} Guides &rarr;
                      </a>
                    </div>
                    <div class="nav-grid">
                      {homeSections.docs.items.map((doc: any) => (
                        <a key={doc.path} href={doc.path} class="nav-item">
                          <span class="nav-title">{doc.title}</span>
                          <span class="nav-desc">{doc.desc}</span>
                        </a>
                      ))}
                    </div>
                  </section>
                )}

                {/* 2. Engineering Blog Links */}
                {homeSections.blog.items.length > 0 && (
                  <section class="card" aria-label="Engineering Blog">
                    <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.5rem;">
                      <h2 style="font-size: 18px; margin: 0; color: #ffffff;">{homeSections.blog.title}</h2>
                      <a href={homeSections.blog.allPath} style="font-size: 12px; color: #818cf8; text-decoration: none; font-weight: bold;">
                        Read All Articles &rarr;
                      </a>
                    </div>
                    <div class="nav-grid">
                      {homeSections.blog.items.map((post: any) => (
                        <a key={post.path} href={post.path} class="nav-item">
                          <span class="nav-title">{post.title}</span>
                          <span class="nav-desc">{post.desc}</span>
                        </a>
                      ))}
                    </div>
                  </section>
                )}

                {/* 3. Performance Optimizations */}
                {homeSections.optimizations.items.length > 0 && (
                  <section class="card" aria-label="Performance Tuning">
                    <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.5rem;">
                      <h2 style="font-size: 18px; margin: 0; color: #ffffff;">{homeSections.optimizations.title}</h2>
                      <a href={homeSections.optimizations.allPath} style="font-size: 12px; color: #818cf8; text-decoration: none; font-weight: bold;">
                        View All Benchmarks &rarr;
                      </a>
                    </div>
                    <div class="nav-grid">
                      {homeSections.optimizations.items.map((opt: any) => (
                        <a key={opt.path} href={opt.path} class="nav-item">
                          <span class="nav-title">{opt.title}</span>
                          <span class="nav-desc">{opt.desc}</span>
                        </a>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* Static Core Sitemap Grid */}
            <section class="card" aria-label="Platform Directory">
              <h2 style="font-size: 18px; margin-top: 0; color: #ffffff;">Platform Navigation & Sitemap</h2>
              {siteNavigation.map((sec) => (
                <div key={sec.category} style="margin-bottom: 1.5rem;">
                  <h3 style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #34d399; margin: 0 0 0.5rem 0;">
                    {sec.category}
                  </h3>
                  <div class="nav-grid">
                    {sec.links.map((item) => (
                      <a key={item.path} href={item.path} class="nav-item">
                        <span class="nav-title">{item.label} &rarr;</span>
                        <span class="nav-desc">{item.desc}</span>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </section>

            {/* Interactive App Link */}
            <div style="text-align: center; margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #1e293b;">
              <p style="font-size: 14px; color: #64748b; margin-bottom: 1rem;">
                Viewing the pre-rendered indexable snapshot of this resource.
              </p>
              <a href={pageUrl} class="cta-btn">
                Launch Interactive App in ApexKit Hub &rarr;
              </a>
            </div>
          </main>
        </div>
      </body>
    </html>
  );
};