/** @type {import("../apexkit").FileMetadata} */
export const __fileMetadata__ = {
  "id": 206,
  "name": "api-scope-util",
  "extension": "js",
  "target_collection": null,
  "type": "webhook",
  "path": "./webhooks/",
  "trigger_type": "manual",
  "active": true,
  "visibility": "public"
};

import { Hono } from "https://esm.sh/hono";

const app = new Hono();

// Helper to reliably extract authenticated user claims
const getAuthUser = (c) => {
    const auth = c.req.raw.auth;
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

// -------------------------------------------------------------
// 1. PROVISION SANDBOX (/sandbox)
// -------------------------------------------------------------
app.post("/sandbox", async (c) => {
    const user = getAuthUser(c);
    if (!user || !user.id) {
        return c.json({ error: "Unauthorized: Missing or invalid authentication token" }, 401);
    }

    // Quota Enforcement: 50MB across user's sandboxes
    const mySandboxesRes = await $db.records.list("sandbox_requests", {
        filter: JSON.stringify({ created_by: user.id })
    }).catch(() => ({ items: [] }));

    const mySandboxes = mySandboxesRes.items || [];
    let totalUsageBytes = 0;
    const LIMIT_BYTES = 50 * 1024 * 1024; // 50 MB

    for (const sb of mySandboxes) {
        const sbId = sb.data ? (sb.data.sandbox_id || sb.data.id) : sb.id;
        if (sbId) {
            try {
                const size = await $root.getSandboxDiskUsage(sbId);
                totalUsageBytes += (size || 0);
            } catch (e) {}
        }
    }

    if (totalUsageBytes > LIMIT_BYTES) {
        const usedMB = (totalUsageBytes / 1024 / 1024).toFixed(2);
        return c.json({
            error: `Quota Exceeded. You are using ${usedMB}MB / 50MB across your sandboxes. Please delete old sessions.`
        }, 403);
    }

    const body = await c.req.json().catch(() => ({}));
    const sandboxId = $util.uuid();

    console.log(`[ScopeUtil] Provisioning EMPTY sandbox [${sandboxId}] for user ${user.id}...`);

    try {
        await $root.createSandbox(sandboxId, {
            name: body.name || `Sandbox ${sandboxId.substring(0, 6)}`,
            owner_id: user.id,
            clone_strategy: "none",
            expires_at: new Date(Date.now() + 86400000).toISOString()
        });

        // 10-second sync window for Master-Replica clusters
        console.log(`[ScopeUtil] Waiting for Master sync on sandbox [${sandboxId}]...`);
        $util.sleep(10000);
    } catch (err) {
        console.log(`[ScopeUtil] Sandbox creation delay/warning: ${err.toString()}`);
        $util.sleep(10000);
        try {
            const appUrl = $env.APP_URL || "http://127.0.0.1:5000";
            await $http.get(`${appUrl}/sandbox/${sandboxId}/app-name`);
        } catch (e) {}
    }

    // Bootstrap Admin Users inside Sandbox
    const sandboxContext = `sandbox:${sandboxId}`;
    try {
        await $root.db.users.create(sandboxContext, "sandbox-admin@apexkit.io", "password", "admin");

        if (user.email && user.email !== "sandbox-admin@apexkit.io") {
            await $root.db.users.create(sandboxContext, user.email, "password", "admin");
        }

        const customEmail = body.admin_email || body.email;
        const customPassword = body.admin_password || body.password;
        if (customEmail && customPassword) {
            await $root.db.users.create(sandboxContext, customEmail, customPassword, "admin");
        }
    } catch (err) {
        console.log(`[ScopeUtil] Admin user bootstrap warning: ${err.toString()}`);
    }

    return c.json({
        success: true,
        sandbox_id: sandboxId,
        quota_usage_mb: (totalUsageBytes / 1024 / 1024).toFixed(2)
    });
});

// -------------------------------------------------------------
// 2. PROVISION TENANT (/tenant)
// -------------------------------------------------------------
app.post("/tenant", async (c) => {
    const user = getAuthUser(c);
    if (!user || !user.id || !user.email) {
        return c.json({ error: "Unauthorized: Missing or invalid authentication token" }, 401);
    }

    // Quota Enforcement: Maximum 3 tenant applications per user
    const myTenants = await $db.records.list("tenant_registry", {
        filter: JSON.stringify({ owner_id: user.id })
    }).catch(() => ({ total: 0 }));

    const MAX_TENANTS = 3;
    if (myTenants && myTenants.total >= MAX_TENANTS) {
        return c.json({
            error: `Quota Exceeded. You already own ${MAX_TENANTS} tenant applications.`
        }, 403);
    }

    const body = await c.req.json().catch(() => ({}));
    const appName = body.app_name || body.name || "My Awesome App";
    let rawTenantId = body.tenant_id || appName;
    const cleanSlug = $util.slugify(rawTenantId);

    const tenantId = body.tenant_id 
        ? cleanSlug 
        : `${cleanSlug}-${$util.uuid().substring(0, 6)}`;

    if (!tenantId || tenantId.length < 3) {
        return c.json({ error: "Tenant ID must be at least 3 characters long." }, 400);
    }

    // Verify Tenant ID uniqueness
    const existingCheck = await $db.records.list("tenant_registry", {
        filter: JSON.stringify({ tenant_id: tenantId })
    }).catch(() => ({ total: 0 }));

    if (existingCheck && existingCheck.total > 0) {
        return c.json({ error: `Tenant ID '${tenantId}' is already taken. Please choose another.` }, 409);
    }

    console.log(`[ScopeUtil] Provisioning Tenant [${tenantId}] (${appName}) for ${user.email}...`);

    try {
        await $root.createTenant(tenantId, {
            name: appName,
            owner_id: user.id,
            tier: body.tier || "free"
        });
        
        console.log(`[ScopeUtil] Waiting for Master sync on tenant [${tenantId}]...`);
        $util.sleep(10000);
    } catch (err) {
        console.log(`[ScopeUtil] Tenant creation replica delay: ${err.toString()}`);
        $util.sleep(10000);
        try {
            const appUrl = $env.APP_URL || "http://127.0.0.1:5000";
            await $http.get(`${appUrl}/tenant/${tenantId}/app-name`);
        } catch (e) {}
    }

    // Register tenant metadata
    await $db.records.create("tenant_registry", {
        owner_id: user.id,
        tenant_id: tenantId,
        app_name: appName,
        usage_or_description: body.usage_or_description || null
    });

    // Bootstrap Admin User
    const tenantContext = `tenant:${tenantId}`;
    const defaultPassword = $util.randomHex(6);

    try {
        await $root.db.users.create(
            tenantContext,
            user.email,
            defaultPassword,
            "admin"
        );
    } catch (err) {
        console.log(`[ScopeUtil] Tenant admin bootstrap warning: ${err.toString()}`);
    }

    // Dispatch Credentials Email
    const appUrl = $env.APP_URL || "https://api.apexkit.io";
    const dashboardUrl = `${appUrl}/_dashboard/tenant/${tenantId}`;

    const emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h1 style="color: #2563eb;">Your App is Live! 🚀</h1>
            <p>Your isolated backend environment <strong>${appName}</strong> has been provisioned.</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <ul style="list-style: none; padding: 0; margin: 0; line-height: 1.6;">
                    <li><strong>Tenant ID:</strong> <code>${tenantId}</code></li>
                    <li><strong>App Name:</strong> ${appName}</li>
                    <li><strong>Admin Email:</strong> ${user.email}</li>
                    <li><strong>Temp Password:</strong> <code>${defaultPassword}</code></li>
                </ul>
            </div>
            <p>
                <a href="${dashboardUrl}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                    Go to Dashboard
                </a>
            </p>
        </div>
    `;

    try {
        const subject = `Welcome to ${appName} - Credentials Inside`;
        if (!$env.SMTP_BLOCKED) {
            await $mail.send(user.email, subject, emailHtml);
        } else {
            await $run.script("send-mail", { toEmail: user.email, htmlContent: emailHtml, subject });
        }
    } catch (e) {}

    return c.json({
        success: true,
        tenant_id: tenantId,
        app_name: appName,
        links: { dashboard: dashboardUrl }
    });
});

// -------------------------------------------------------------
// 3. DISK USAGE INSPECTORS (/usage/...)
// -------------------------------------------------------------
app.get("/usage/tenant/:id", async (c) => {
    const tenantId = c.req.param("id");
    try {
        const bytes = await $root.getTenantDiskUsage(tenantId);
        return c.json({
            success: true,
            tenant: tenantId,
            usage_bytes: bytes,
            usage_mb: (bytes / 1024 / 1024).toFixed(2)
        });
    } catch (e) {
        return c.json({ error: e.toString() }, 500);
    }
});

app.get("/usage/sandbox/:id", async (c) => {
    const sandboxId = c.req.param("id");
    try {
        const bytes = await $root.getSandboxDiskUsage(sandboxId);
        return c.json({
            success: true,
            sandbox: sandboxId,
            usage_bytes: bytes,
            usage_mb: (bytes / 1024 / 1024).toFixed(2)
        });
    } catch (e) {
        return c.json({ error: e.toString() }, 500);
    }
});

export default async function (req) {
    return app.fetch(req);
}