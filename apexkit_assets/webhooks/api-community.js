/** @type {import("../apexkit").FileMetadata} */
export const __fileMetadata__ = {
  "id": 2,
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

// Helper: Safely extracts profile metadata whether expanded as an Array or a single Object
const extractProfileData = (expandObj, fieldName = "author_id", fallbackName = "Community Member") => {
    if (!expandObj || !expandObj[fieldName]) {
        return { username: fallbackName, avatar: null };
    }

    let profile = expandObj[fieldName];

    // Check if relation is expanded as an Array [0] or direct Object
    if (Array.isArray(profile)) {
        profile = profile[0];
    }

    if (!profile) {
        return { username: fallbackName, avatar: null };
    }

    const username = profile.data?.username || profile.username || fallbackName;
    const avatar = profile.data?.avatar || profile.avatar || null;

    return { username, avatar };
};

// Helper to reliably extract authenticated user claims
const getAuthUser = (c) => {
    const auth = c.req.raw?.auth;
    if (auth && auth.id) return auth;

    const authHeader = c.req.header("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
        try {
            const tokenParts = authHeader.split(" ")[1].split(".");
            if (tokenParts.length === 3) {
                const claims = JSON.parse($util.base64Decode(tokenParts[1]));
                return {
                    id: claims.uid,
                    email: claims.sub,
                    role: claims.role,
                    scope: claims.scope
                };
            }
        } catch (e) {}
    }
    return null;
};

// Auth Middleware: Resolves JWT and maps to a unified Profile ID
const authMiddleware = async (c, next) => {
    const auth = getAuthUser(c);
    if (!auth || !auth.id) return c.json({ error: "Unauthorized" }, 401);
    
    const profiles = await $db.records.list("profiles", { 
        filter: JSON.stringify({ user_id: auth.id }), limit: 1 
    }).catch(() => ({ items: [], total: 0 }));
    
    if (profiles.total === 0) {
        const created = await $db.records.create("profiles", { 
            user_id: auth.id, 
            username: (auth.email || "user").split('@')[0]
        });
        c.set('profile_id', created.id || created);
    } else {
        c.set('profile_id', profiles.items[0].id);
    }
    
    c.set('user', auth);
    await next();
};

// ----------------------------------------------------
// ECOSYSTEM ITEMS ROUTER
// ----------------------------------------------------
app.get("/ecosystem/items", async (c) => {
    const tab = c.req.query("tab") || "marketplace";
    const q = c.req.query("q") || "";

    let filter = {};
    if (tab === 'starters') filter.type = { $in: ['site', 'starter'] };
    else if (tab === 'scripts') filter.type = 'script';
    else if (tab === 'modules') filter.type = { $in: ['module', 'schema', 'template', 'ai_action'] };
    else if (tab === 'showcase') filter.type = 'showcase';

    if (q) {
        filter.$or = [
            { title: { $contains: q } },
            { description: { $contains: q } }
        ];
    }

    const filterStr = Object.keys(filter).length ? JSON.stringify(filter) : null;

    const res = await $db.records.list("ecosystem_items", {
        sort: "-created", expand: "author_id", per_page: 200,
        filter: filterStr
    }).catch(() => ({ items: [], total: 0 }));

    const items = (res.items || []).map(item => {
        let tags = [];
        if (Array.isArray(item.data?.tags)) tags = item.data.tags;
        else if (typeof item.data?.tags === 'string') {
            try { tags = JSON.parse(item.data.tags); } catch (e) {}
        }

        const profile = extractProfileData(item.expand, "author_id", "Community");

        return {
            id: item.id,
            title: item.data?.title || 'Untitled',
            type: item.data?.type || 'script',
            description: item.data?.description || '',
            file: item.data?.file,
            url: item.data?.url || item.data?.repoUrl,
            installCommand: item.data?.installCommand || item.data?.install_command,
            tags,
            author: profile.username,
            author_avatar: profile.avatar,
            created: item.created,
            raw: item
        };
    });

    return c.json({ success: true, items });
});

app.post("/ecosystem/items", authMiddleware, async (c) => {
    const profileId = c.get('profile_id');
    const body = await c.req.json();
    
    const created = await $db.records.create("ecosystem_items", {
        title: body.title,
        type: body.type,
        description: body.description,
        url: body.url || null,
        file: body.file || null,
        tags: body.tags || [],
        author_id: profileId
    });
    return c.json({ success: true, id: created.id || created });
});

// ----------------------------------------------------
// COMMUNITY THREADS (Issues / Discussions)
// ----------------------------------------------------
app.get("/ecosystem/threads", async (c) => {
    const type = c.req.query("type") || "discussion";
    const res = await $db.records.list("community_threads", {
        filter: JSON.stringify({ type }), sort: "-created", expand: "author_id", per_page: 100
    }).catch(() => ({ items: [] }));
    
    const items = (res.items || []).map(item => {
        const profile = extractProfileData(item.expand, "author_id");
        return {
            id: item.id,
            title: item.data?.title,
            content: item.data?.content,
            status: item.data?.status || 'open',
            type: item.data?.type,
            author_username: profile.username,
            author_avatar: profile.avatar,
            created: item.created
        };
    });
    
    return c.json({ success: true, items });
});

app.post("/ecosystem/threads", authMiddleware, async (c) => {
    const profileId = c.get('profile_id');
    const body = await c.req.json();
    
    const created = await $db.records.create("community_threads", {
        title: body.title,
        content: body.content,
        type: body.type,
        status: 'open',
        author_id: profileId
    });

    const threadId = created.id || created;
    const item = await $db.records.get("community_threads", threadId, "author_id");
    
    if (!item) return c.json({ error: "Failed to retrieve created thread" }, 500);

    const profile = extractProfileData(item.expand, "author_id");

    return c.json({ success: true, item: {
        id: item.id,
        title: item.data?.title,
        content: item.data?.content,
        status: item.data?.status || 'open',
        type: item.data?.type,
        author_username: profile.username,
        author_avatar: profile.avatar,
        created: item.created
    }});
});

app.get("/ecosystem/threads/:id", async (c) => {
    const id = c.req.param("id");
    const thread = await $db.records.get("community_threads", id, "author_id").catch(() => null);
    if (!thread) return c.json({ error: "Not found" }, 404);
    
    const profile = extractProfileData(thread.expand, "author_id");

    return c.json({
        success: true,
        item: {
            id: thread.id,
            title: thread.data?.title,
            content: thread.data?.content,
            status: thread.data?.status || 'open',
            type: thread.data?.type,
            author_username: profile.username,
            author_avatar: profile.avatar,
            created: thread.created
        }
    });
});

app.get("/ecosystem/threads/:id/comments", async (c) => {
    const id = c.req.param("id");
    const res = await $db.records.list("thread_comments", {
        filter: JSON.stringify({ thread_id: id }),
        sort: "created", expand: "author_id", per_page: 100
    }).catch(() => ({ items: [] }));
    
    const items = (res.items || []).map(item => {
        const profile = extractProfileData(item.expand, "author_id");
        return {
            id: item.id,
            content: item.data?.content,
            author_username: profile.username,
            author_avatar: profile.avatar,
            created: item.created
        };
    });
    
    return c.json({ success: true, items });
});

app.post("/ecosystem/threads/:id/comments", authMiddleware, async (c) => {
    const profileId = c.get('profile_id');
    const id = c.req.param("id");
    const body = await c.req.json();
    
    const created = await $db.records.create("thread_comments", {
        thread_id: id,
        content: body.content,
        author_id: profileId
    });
    
    const commentId = created.id || created;
    const item = await $db.records.get("thread_comments", commentId, "author_id");
    
    if (!item) return c.json({ error: "Failed to retrieve created comment" }, 500);

    const profile = extractProfileData(item.expand, "author_id");

    const commentData = {
        id: item.id,
        content: item.data?.content,
        author_username: profile.username,
        author_avatar: profile.avatar,
        created: item.created
    };

    // Broadcast normalized data directly to connected real-time clients
    await $realtime.send(`thread_${id}`, "new_comment", commentData);

    return c.json({ success: true, comment: commentData });
});

// ----------------------------------------------------
// TENANCY OFFERS
// ----------------------------------------------------
app.get("/ecosystem/tenancy", async (c) => {
    const res = await $db.records.list("tenancy_offers", {
        sort: "-created", expand: "provider_id", per_page: 50
    }).catch(() => ({ items: [] }));
    
    const items = (res.items || []).map(item => {
        const profile = extractProfileData(item.expand, "provider_id", "Community Provider");
        return {
            id: item.id,
            provider_name: item.data?.provider_name,
            region: item.data?.region,
            specs: item.data?.specs,
            description: item.data?.description,
            available_slots: item.data?.available_slots,
            status: item.data?.status,
            author_username: profile.username,
            author_avatar: profile.avatar,
            created: item.created
        };
    });
    
    return c.json({ success: true, items });
});

app.post("/ecosystem/tenancy", authMiddleware, async (c) => {
    const profileId = c.get('profile_id');
    const body = await c.req.json();
    
    const created = await $db.records.create("tenancy_offers", {
        provider_name: body.provider_name,
        region: body.region,
        specs: body.specs,
        description: body.description,
        available_slots: Number(body.available_slots) || 0,
        status: body.status || 'available',
        provider_id: profileId
    });
    
    const offerId = created.id || created;
    const item = await $db.records.get("tenancy_offers", offerId, "provider_id");
    
    if (!item) return c.json({ error: "Failed to retrieve created offer" }, 500);

    const profile = extractProfileData(item.expand, "provider_id", "Community Provider");

    return c.json({ success: true, item: {
        id: item.id,
        provider_name: item.data?.provider_name,
        region: item.data?.region,
        specs: item.data?.specs,
        description: item.data?.description,
        available_slots: item.data?.available_slots,
        status: item.data?.status,
        author_username: profile.username,
        author_avatar: profile.avatar,
        created: item.created
    }});
});

// ----------------------------------------------------
// OPTIMIZATIONS ROUTER
// ----------------------------------------------------
app.get("/optimizations", async (c) => {
    const page = parseInt(c.req.query("page") || "1", 10);
    const tag = c.req.query("tag") || null;
    const q = c.req.query("q") || null;
    const user = c.req.raw?.auth;
    
    let profileId = null;
    if (user && user.id) {
        const profiles = await $db.records.list("profiles", { filter: JSON.stringify({ user_id: user.id }), limit: 1 });
        if (profiles.total > 0) profileId = profiles.items[0].id;
    }

    const allOpts = await $db.records.list("optimizations", { limit: 5000 }).catch(() => ({ items: [] }));
    const tagCounts = {};
    for (const item of allOpts.items || []) {
        const tags = Array.isArray(item.data?.tags) ? item.data.tags : [];
        tags.forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; });
    }
    const topTags = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a]).slice(0, 50);

    let filterObj = null;
    if (q) filterObj = { title: { $contains: q } };

    const paginatedRes = await $db.records.list("optimizations", {
        page, per_page: 20, sort: "-created", expand: "author_id",
        filter: filterObj ? JSON.stringify(filterObj) : null
    }).catch(() => ({ items: [], total: 0 }));

    let items = paginatedRes.items || [];
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
    const user = c.req.raw?.auth;
    
    let profileId = null;
    if (user && user.id) {
        const profiles = await $db.records.list("profiles", { filter: JSON.stringify({ user_id: user.id }), limit: 1 });
        if (profiles.total > 0) profileId = profiles.items[0].id;
    }

    const opt = await $db.records.get("optimizations", id, "author_id").catch(() => null);
    if (!opt) return c.json({ error: "Optimization strategy not found" }, 404);

    const commentsRes = await $db.records.list("optimizations_conversations", {
        filter: JSON.stringify({ optimization_id: id }),
        sort: "created",
        expand: "author_id",
        limit: 100
    }).catch(() => ({ items: [] }));

    const normComments = (commentsRes.items || []).map(item => {
        const profile = extractProfileData(item.expand, "author_id");
        return {
            id: item.id,
            content: item.data?.content,
            author_username: profile.username,
            author_avatar: profile.avatar,
            created: item.created
        };
    });

    let userVote = null;
    if (profileId) {
        const voteRes = await $db.records.list("optimizations_votes", {
            filter: JSON.stringify({ optimization_id: id, voter_id: profileId }), limit: 1
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
            comments: normComments
        }
    });
});

app.post("/optimizations", authMiddleware, async (c) => {
    const profileId = c.get('profile_id');
    const body = await c.req.json();
    
    if (!body.title || !body.content) return c.json({ error: "Missing title or content" }, 400);

    const slug = $util.slugify(body.title) + "-" + $util.randomHex(3);
    const tags = Array.isArray(body.tags) ? body.tags : [];

    const created = await $db.records.create("optimizations", {
        title: body.title,
        content: body.content,
        slug, tags, upvotes: 0, downvotes: 0,
        author_id: profileId
    });

    return c.json({ success: true, id: created.id || created, slug });
});

app.post("/optimizations/:id/comments", authMiddleware, async (c) => {
    const profileId = c.get('profile_id');
    const id = c.req.param("id");
    const body = await c.req.json();

    if (!body.content) return c.json({ error: "Missing content" }, 400);

    const created = await $db.records.create("optimizations_conversations", {
        optimization_id: id,
        content: body.content,
        author_id: profileId
    });
    
    const commentId = created.id || created;
    const item = await $db.records.get("optimizations_conversations", commentId, "author_id");
    
    if (!item) return c.json({ error: "Failed to retrieve created comment" }, 500);

    const profile = extractProfileData(item.expand, "author_id");

    const commentData = {
        id: item.id,
        content: item.data?.content,
        author_username: profile.username,
        author_avatar: profile.avatar,
        created: item.created
    };

    await $realtime.send(`opt_${id}`, "new_comment", commentData);

    return c.json({ success: true, comment: commentData });
});

app.post("/optimizations/vote", authMiddleware, async (c) => {
    const profileId = c.get('profile_id');
    const { optimization_id, type } = await c.req.json();
    
    if (!['up', 'down'].includes(type)) return c.json({ error: "Invalid vote type" }, 400);

    const voteData = await $db.records.list("optimizations_votes", {
        filter: JSON.stringify({ optimization_id: optimization_id, voter_id: profileId }), limit: 1
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
        await $db.records.create("optimizations_votes", { optimization_id: optimization_id, voter_id: profileId, type });
    }

    const upVotesRes = await $db.records.list("optimizations_votes", {
        filter: JSON.stringify({ optimization_id: optimization_id, type: 'up' }), limit: 1
    });
    const downVotesRes = await $db.records.list("optimizations_votes", {
        filter: JSON.stringify({ optimization_id: optimization_id, type: 'down' }), limit: 1
    });

    const up = upVotesRes.total || 0;
    const down = downVotesRes.total || 0;

    await $db.records.update("optimizations", optimization_id, { upvotes: up, downvotes: down });

    await $realtime.send(`opt_${optimization_id}`, "vote_update", { upvotes: up, downvotes: down });

    return c.json({ success: true, action, upvotes: up, downvotes: down, user_vote: action === "removed" ? null : type });
});

export default async function (req) {
    return app.fetch(req);
}