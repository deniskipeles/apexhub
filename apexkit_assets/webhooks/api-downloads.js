/** @type {import("../apexkit").FileMetadata} */
export const __fileMetadata__ = {
  "id": 4,
  "name": "api-downloads",
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
const OWNER = "deniskipeles";
const REPO = "apexkit";
const CACHE_TTL_SECONDS = 600; // Cache release metadata for 10 minutes

/**
 * Helper to fetch and cache GitHub release metadata
 */
async function getLatestRelease() {
    const cacheKey = `gh_release_latest_${OWNER}_${REPO}`;
    
    // 1. Check in-memory $cache first
    const cached = await $cache.get(cacheKey);
    if (cached) {
        try {
            return { ok: true, data: JSON.parse(cached), fromCache: true };
        } catch (e) {}
    }

    // 2. Resolve GITHUB_TOKEN from DB secrets or .env
    const token = await $env.get("GITHUB_TOKEN");
    const headers = {
        "User-Agent": "ApexKit-Hub",
        "Accept": "application/vnd.github.v3+json"
    };
    if (token && token.trim()) {
        headers["Authorization"] = `Bearer ${token.trim()}`;
    }

    const metadataUrl = `https://api.github.com/repos/${OWNER}/${REPO}/releases/latest`;
    const releaseRes = await fetch(metadataUrl, { headers });

    if (!releaseRes.ok) {
        const errBody = await releaseRes.text().catch(() => "");
        let errMsg = `GitHub API error: ${releaseRes.status}`;
        
        if (releaseRes.status === 403) {
            errMsg = "GitHub API rate limit exceeded (60 req/hr on shared IP). Add 'GITHUB_TOKEN' to your ApexKit config settings or .env file.";
        }
        return { ok: false, status: releaseRes.status, error: errMsg, raw: errBody };
    }

    const releaseData = await releaseRes.json();
    
    // 3. Store in $cache
    await $cache.set(cacheKey, JSON.stringify(releaseData), CACHE_TTL_SECONDS);

    return { ok: true, data: releaseData, fromCache: false };
}

app.get("/info", async (c) => {
    try {
        const token = await $env.get("GITHUB_TOKEN");
        const releaseResult = await getLatestRelease();

        if (!releaseResult.ok) {
            return c.json({ error: releaseResult.error, status: releaseResult.status }, 502);
        }

        const release = releaseResult.data;
        
        // Parse Checksums
        const checksumAsset = (release.assets || []).find(a => 
            a.name.toLowerCase().includes("checksum") || a.name.toLowerCase().endsWith(".sha256")
        );
        let checksumContent = "";
        
        if (checksumAsset) {
            let downloadUrl = checksumAsset.browser_download_url;
            
            // Handle private release asset redirect if token exists
            if (token && token.trim()) {
                try {
                    const rawRes = await $__native_fetch(checksumAsset.url, {
                        method: "GET",
                        headers: {
                            "Accept": "application/octet-stream",
                            "User-Agent": "ApexKit",
                            "Authorization": `Bearer ${token.trim()}`
                        },
                        redirect: "manual"
                    });
                    if (rawRes.status === 302 && rawRes.headers && rawRes.headers.location) {
                        downloadUrl = rawRes.headers.location;
                    }
                } catch (e) {
                    console.log("Failed to resolve checksum redirect:", e);
                }
            }

            const fileRes = await fetch(downloadUrl, { headers: { "User-Agent": "ApexKit" } });
            if (fileRes.ok) {
                checksumContent = await fileRes.text();
            } else {
                checksumContent = release.body || "";
            }
        } else {
            checksumContent = release.body || "";
        }

        // Filter valid binary release artifacts
        const artifacts = (release.assets || [])
            .filter(a => !a.name.toLowerCase().includes("checksum") && !a.name.toLowerCase().endsWith(".sha256"))
            .map(a => ({
                name: a.name,
                size: a.size,
                download_count: a.download_count
            }));

        return c.json({
            success: true,
            version: release.tag_name,
            date: release.published_at,
            checksums: checksumContent,
            body: release.body,
            artifacts
        });

    } catch (err) {
        return c.json({ error: err.message || err.toString() }, 500);
    }
});

app.post("/latest", async (c) => {
    try {
        const body = await c.req.json().catch(() => ({}));
        const targetName = body.name;
        const os = body.os || "linux";

        const token = await $env.get("GITHUB_TOKEN");
        const releaseResult = await getLatestRelease();

        if (!releaseResult.ok) {
            return c.json({ error: releaseResult.error }, 502);
        }

        const release = releaseResult.data;

        // Locate Target Asset dynamically
        let asset;
        if (targetName) {
            asset = (release.assets || []).find(a => 
                a.name === targetName || a.name.toLowerCase().includes(targetName.toLowerCase())
            );
        } else {
            let pattern = "linux";
            if (os === "windows") pattern = "windows";
            if (os === "macos" || os === "darwin") pattern = "darwin";
            asset = (release.assets || []).find(a => 
                a.name.toLowerCase().includes(pattern) && !a.name.toLowerCase().includes("checksum")
            );
        }

        if (!asset) return c.json({ error: "Asset not found in latest release" }, 404);

        let downloadUrl = asset.browser_download_url;

        // Resolve download redirect URL for private repo assets
        if (token && token.trim()) {
            try {
                const rawRes = await $__native_fetch(asset.url, {
                    method: "GET",
                    headers: {
                        "Accept": "application/octet-stream",
                        "User-Agent": "ApexKit",
                        "Authorization": `Bearer ${token.trim()}`
                    },
                    redirect: "manual"
                });
                
                if (rawRes.status === 302 && rawRes.headers && rawRes.headers.location) {
                    downloadUrl = rawRes.headers.location;
                }
            } catch (e) {
                console.log("Failed to resolve binary redirect:", e);
            }
        }

        return c.json({
            success: true,
            downloadUrl: downloadUrl,
            filename: asset.name
        });

    } catch (err) {
        return c.json({ error: err.message || err.toString() }, 500);
    }
});

export default async function (req) {
    return app.fetch(req);
}