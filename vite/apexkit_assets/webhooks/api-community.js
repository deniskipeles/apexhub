/** @type {import("../apexkit").FileMetadata} */
export const __fileMetadata__ = {
  "id": 547,
  "name": "api-community",
  "extension": "js",
  "target_collection": null,
  "type": "webhook",
  "path": "./webhooks/",
  "trigger_type": "manual",
  "active": true,
  "visibility": "private"
};

import { Hono } from "https://esm.sh/hono";

const app = new Hono();

// Auth Middleware
const authMiddleware = async (c, next) => {
    // ApexKit automatically parses JWT tokens and injects req.auth
    const auth = c.req.raw.auth;
    if (!auth || !auth.id) {
        return c.json({ error: "Unauthorized" }, 401);
    }
    c.set('user', auth);
    await next();
};

/**
 * OPTIMIZATIONS ROUTES
 */
app.get("/optimizations", async (c) => {
    const page = parseInt(c.req.query("page") || "1", 10);
    const user = c.req.raw.auth; // Optional auth
    
    // Aggregate top tags (fast fetch)
    const allOpts = await $db.records.list("optimizations", { limit: 5000 }).catch(() => ({ items: [] }));
    const tagCounts = {};
    for (const item of allOpts.items || []) {
        const tags = Array.isArray(item.data?.tags) ? item.data.tags : [];
        tags.forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; });
    }
    const topTags = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a]).slice(0, 50);

    // Fetch Paginated List
    const paginatedRes = await $db.records.list("optimizations", {
        page, per_page: 20, sort: "-created", expand: "author_id"
    }).catch(() => ({ items: [], total: 0 }));

    const processedItems = [];
    for (const item of paginatedRes.items || []) {
        // Fetch Comments Count
        const comments = await $db.records.list("thread_comments", {
            filter: JSON.stringify({ thread_id: item.id }), limit: 1
        }).catch(() => ({ total: 0 }));

        let userVote = null;
        if (user && user.id) {
            const voteRes = await $db.records.list("optimizations_votes", {
                filter: JSON.stringify({ optimization_id: item.id, voter_id: user.id }), limit: 1
            });
            if (voteRes?.total > 0) userVote = voteRes.items[0].data.type;
        }

        processedItems.push({
            id: item.id,
            created: item.created,
            data: { ...item.data, user_vote: userVote },
            expand: { ...item.expand, comments_count: comments.total }
        });
    }

    return c.json({ success: true, tags: topTags, items: processedItems, total: paginatedRes.total, page });
});

app.post("/optimizations/vote", authMiddleware, async (c) => {
    const user = c.get('user');
    const { optimization_id, type } = await c.req.json();
    
    if (!['up', 'down'].includes(type)) return c.json({ error: "Invalid vote type" }, 400);

    const voteData = await $db.records.list("optimizations_votes", {
        filter: JSON.stringify({ optimization_id, voter_id: user.id })
    });

    let action = "voted";
    if (voteData.total > 0) {
        const vote = voteData.items[0];
        if (vote.data.type === type) {
            await $db.records.delete("optimizations_votes", vote.id);
            action = "removed";
        } else {
            await $db.records.update("optimizations_votes", vote.id, { type });
            action = "changed";
        }
    } else {
        await $db.records.create("optimizations_votes", { optimization_id, voter_id: user.id, type });
    }

    // Recalculate totals
    const allVotes = await $db.records.list("optimizations_votes", { filter: JSON.stringify({ optimization_id }), limit: 5000 });
    let up = 0, down = 0;
    for (const v of allVotes.items || []) {
        if (v.data.type === 'up') up++; else down++;
    }

    await $db.records.update("optimizations", optimization_id, { upvotes: up, downvotes: down });

    return c.json({ success: true, action, upvotes: up, downvotes: down, user_vote: action === "removed" ? null : type });
});

export default async function (req) {
    return app.fetch(req);
}