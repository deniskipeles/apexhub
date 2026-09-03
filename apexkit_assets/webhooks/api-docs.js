/** @type {import("../apexkit").FileMetadata} */
export const __fileMetadata__ = {
  "id": 176,
  "name": "api-docs",
  "extension": "js",
  "target_collection": "docs",
  "type": "webhook",
  "path": "./webhooks/",
  "trigger_type": "manual",
  "active": true,
  "visibility": "public"
};

import { Hono } from "https://esm.sh/hono";

const app = new Hono();

/**
 * Single-trip Edge Document & Related Articles Resolver
 * GET /webhook/api-docs/:idOrSlug
 */
app.get("/:idOrSlug", async (c) => {
    const idOrSlug = c.req.param("idOrSlug");
    if (!idOrSlug) {
        return c.json({ error: "Missing document identifier" }, 400);
    }

    try {
        let doc = null;

        // 1. Try finding by slug first
        const slugQuery = await $db.records.list("docs", {
            filter: JSON.stringify({ slug: idOrSlug }),
            expand: "added_by",
            limit: 1
        }).catch(() => ({ items: [] }));

        if (slugQuery.items && slugQuery.items.length > 0) {
            doc = slugQuery.items[0];
        }

        // 2. Fallback: Lookup by record ID
        if (!doc) {
            doc = await $db.records.get("docs", idOrSlug, "added_by").catch(() => null);
        }

        if (!doc) {
            return c.json({ error: `Document '${idOrSlug}' not found` }, 404);
        }

        const docId = doc.id;
        let currentSlug = doc.data?.slug;

        // 3. Ensure current document has a slug AND persist to DB for future queries
        if (!currentSlug && doc.data?.title) {
            currentSlug = $util.slugify(doc.data.title);
            doc.data.slug = currentSlug;

            // Save update to database so next queries find it by slug directly
            await $db.records.update("docs", docId, { slug: currentSlug }).catch((err) => {
                console.log("[api-docs] Slug persistence notice:", err.toString());
            });
        }

        // 4. In-Memory Vector Search for related documents
        let relatedDocs = [];
        try {
            const vectors = await $db.records.getVector("docs", docId);
            
            if (vectors && vectors.length > 0) {
                const target = vectors[0];
                const searchResults = await $db.records.searchVector(
                    "docs", 
                    target.field_name, 
                    target.vector, 
                    6
                );
                
                relatedDocs = (searchResults || [])
                    .map((item) => {
                        const record = Array.isArray(item) ? item[0] : (item.record || item);
                        const score = Array.isArray(item) ? item[1] : (item._score ?? item.score);
                        if (!record || !record.id) return null;

                        const data = record.data || {};

                        // Ensure related doc has slug and persist if missing
                        if (!data.slug && data.title) {
                            data.slug = $util.slugify(data.title);
                            $db.records.update("docs", record.id, { slug: data.slug }).catch(() => {});
                        }

                        return {
                            id: record.id,
                            data: data,
                            created: record.created,
                            updated: record.updated,
                            score: score
                        };
                    })
                    // Filter out invalid items and self by ID and slug
                    .filter((r) => r && String(r.id) !== String(docId) && r.data?.slug !== currentSlug && r.data?.slug !== idOrSlug)
                    .slice(0, 3);
            }
        } catch (vErr) {
            console.log("[api-docs] Vector lookup notice:", vErr.toString());
        }

        return c.json({
            success: true,
            doc,
            related: relatedDocs
        });

    } catch (err) {
        return c.json({ error: err.message || err.toString() }, 500);
    }
});

export default async function (req) {
    return app.fetch(req);
}