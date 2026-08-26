/** @type {import("../apexkit").FileMetadata} */
export const __fileMetadata__ = {
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

// Auth Middleware: Resolves JWT and maps to a unified Profile ID
const authMiddleware = async (c, next) => {
    const auth = c.req.raw.auth;
    if (!auth || !auth.id) return c.json({ error: "Unauthorized" }, 401);
    
    const profiles = await $db.records.list("profiles", { 
        filter: JSON.stringify({ user_id: auth.id }), limit: 1 
    });
    
    if (profiles.total === 0) {
        // Auto-provision profile if it doesn't exist
        const res = await $db.records.create("profiles", { 
            user_id: auth.id, 
            username: auth.email.split('@')[0]
        });
        c.set('profile_id', res.id);
    } else {
        c.set('profile_id', profiles.items[0].id);
    }
    
    c.set('user', auth);
    await next();
};

// ----------------------------------------------------
// OPTIMIZATIONS ROUTER
// ----------------------------------------------------

app.get("/optimizations", async (c) => {
    const page = parseInt(c.req.query("page") || "1", 10);
    const tag = c.req.query("tag") || null;
    const q = c.req.query("q") || null;
    const user = c.req.raw.auth;
    
    let profileId = null;
    if (user && user.id) {
        const profiles = await $db.records.list("profiles", { filter: JSON.stringify({ user_id: user.id }), limit: 1 });
        if (profiles.total > 0) profileId = profiles.items[0].id;
    }

    // Aggregate top tags across the platform
    const allOpts = await $db.records.list("optimizations", { limit: 5000 }).catch(() => ({ items: [] }));
    const tagCounts = {};
    for (const item of allOpts.items || []) {
        const tags = Array.isArray(item.data?.tags) ? item.data.tags : [];
        tags.forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; });
    }
    const topTags = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a]).slice(0, 50);

    // Build Search Filter
    let filterObj = null;
    if (q) filterObj = { title: { $contains: q } };

    // Fetch Paginated List
    const paginatedRes = await $db.records.list("optimizations", {
        page, per_page: 20, sort: "-created", expand: "author_id",
        filter: filterObj ? JSON.stringify(filterObj) : null
    }).catch(() => ({ items: [], total: 0 }));

    let items = paginatedRes.items || [];
    
    // In-memory array filter for tags
    if (tag) items = items.filter(i => Array.isArray(i.data?.tags) && i.data.tags.includes(tag));

    const processedItems = [];
    for (const item of items) {
        const comments = await $db.records.list("optimizations_conversations", {
            filter: JSON.stringify({ optimization_id: item.id }), limit: 1
        }).catch(() => ({ total: 0 }));

        let userVote = null;
        if (profileId) {
            const voteRes = await $db.records.list("optimizations_votes", {
                filter: JSON.stringify({ optimization_id: item.id, voter_id: profileId }), limit: 1
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

app.get("/optimizations/:id", async (c) => {
    const id = c.req.param("id");
    const user = c.req.raw.auth;
    
    let profileId = null;
    if (user && user.id) {
        const profiles = await $db.records.list("profiles", { filter: JSON.stringify({ user_id: user.id }), limit: 1 });
        if (profiles.total > 0) profileId = profiles.items[0].id;
    }

    const opt = await $db.records.get("optimizations", id, "author_id").catch(() => null);
    if (!opt) return c.json({ error: "Optimization strategy not found" }, 404);

    const commentsRes = await $db.records.list("optimizations_conversations", {
        filter: JSON.stringify({ optimization_id: Number(id) }),
        sort: "created",
        expand: "author_id",
        limit: 100
    }).catch(() => ({ items: [] }));

    let userVote = null;
    if (profileId) {
        const voteRes = await $db.records.list("optimizations_votes", {
            filter: JSON.stringify({ optimization_id: Number(id), voter_id: profileId }), limit: 1
        });
        if (voteRes?.total > 0) userVote = voteRes.items[0].data.type;
    }

    return c.json({
        success: true,
        item: {
            id: opt.id,
            created: opt.created,
            data: { ...opt.data, user_vote: userVote },
            expand: opt.expand,
            comments: commentsRes.items || []
        }
    });
});

app.post("/optimizations", authMiddleware, async (c) => {
    const profileId = c.get('profile_id');
    const body = await c.req.json();
    
    if (!body.title || !body.content) return c.json({ error: "Missing title or content" }, 400);

    const slug = $util.slugify(body.title) + "-" + $util.randomHex(3);
    const tags = Array.isArray(body.tags) ? body.tags : [];

    const recordId = await $db.records.create("optimizations", {
        title: body.title,
        content: body.content,
        slug, tags, upvotes: 0, downvotes: 0,
        author_id: profileId
    });

    return c.json({ success: true, id: recordId, slug });
});

app.post("/optimizations/:id/comments", authMiddleware, async (c) => {
    const profileId = c.get('profile_id');
    const id = Number(c.req.param("id"));
    const body = await c.req.json();

    if (!body.content) return c.json({ error: "Missing content" }, 400);

    const commentId = await $db.records.create("optimizations_conversations", {
        optimization_id: id,
        content: body.content,
        author_id: profileId
    });
    
    // Fetch newly created comment fully expanded to inject straight into UI
    const comment = await $db.records.get("optimizations_conversations", commentId, "author_id");
    return c.json({ success: true, comment });
});

app.post("/optimizations/vote", authMiddleware, async (c) => {
    const profileId = c.get('profile_id');
    const { optimization_id, type } = await c.req.json();
    const optIdNum = Number(optimization_id);
    
    if (!['up', 'down'].includes(type)) return c.json({ error: "Invalid vote type" }, 400);

    const voteData = await $db.records.list("optimizations_votes", {
        filter: JSON.stringify({ optimization_id: optIdNum, voter_id: profileId })
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
        await $db.records.create("optimizations_votes", { optimization_id: optIdNum, voter_id: profileId, type });
    }

    // Aggregate Recalculation
    const allVotes = await $db.records.list("optimizations_votes", { filter: JSON.stringify({ optimization_id: optIdNum }), limit: 5000 });
    let up = 0, down = 0;
    for (const v of allVotes.items || []) {
        if (v.data.type === 'up') up++; else down++;
    }

    await $db.records.update("optimizations", optIdNum, { upvotes: up, downvotes: down });

    return c.json({ success: true, action, upvotes: up, downvotes: down, user_vote: action === "removed" ? null : type });
});

export default async function (req) {
    return app.fetch(req);
}