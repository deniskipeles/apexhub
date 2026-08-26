/** @type {import("../apexkit").FileMetadata} */
export const __fileMetadata__ = {
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

app.get("/info", async (c) => {
    try {
        const token = await $env.get("GITHUB_TOKEN");
        const headers = { "User-Agent": "ApexKit" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const metadataUrl = `https://api.github.com/repos/${OWNER}/${REPO}/releases/latest`;
        const releaseRes = await fetch(metadataUrl, { headers });

        if (!releaseRes.ok) {
            return c.json({ error: `GitHub API error: ${releaseRes.status}` }, 502);
        }

        const release = await releaseRes.json();
        
        // 1. Parse Checksums
        const checksumAsset = (release.assets || []).find(a => a.name.toLowerCase().includes("checksum"));
        let checksumContent = "";
        
        if (checksumAsset) {
            let downloadUrl = checksumAsset.browser_download_url;
            
            // If we have a token (Private Repo), resolve the secure S3 redirect URL manually
            if (token) {
                try {
                    const rawRes = await $__native_fetch(checksumAsset.url, {
                        method: "GET",
                        headers: {
                            "Accept": "application/octet-stream",
                            "User-Agent": "ApexKit",
                            "Authorization": `Bearer ${token}`
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

        // 2. Dynamically gather all build artifacts (excluding checksum files)
        const artifacts = (release.assets || [])
            .filter(a => !a.name.toLowerCase().includes("checksum") && !a.name.toLowerCase().endsWith(".sha256"))
            .map(a => ({
                name: a.name,
                size: a.size
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
        return c.json({ error: err.message }, 500);
    }
});

app.post("/latest", async (c) => {
    try {
        const body = await c.req.json().catch(() => ({}));
        const targetName = body.name;
        const os = body.os || "linux";

        const token = await $env.get("GITHUB_TOKEN");
        const headers = { "User-Agent": "ApexKit" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        // 1. Fetch Release Metadata
        const metadataUrl = `https://api.github.com/repos/${OWNER}/${REPO}/releases/latest`;
        const releaseRes = await fetch(metadataUrl, { headers });
        if (!releaseRes.ok) return c.json({ error: "GitHub API Error" }, 502);
        
        const release = await releaseRes.json();

        // 2. Locate Target Asset dynamically
        let asset;
        if (targetName) {
            asset = (release.assets || []).find(a => a.name === targetName || a.name.toLowerCase().includes(targetName.toLowerCase()));
        } else {
            let pattern = "linux";
            if (os === "windows") pattern = "windows";
            if (os === "macos" || os === "darwin") pattern = "darwin";
            asset = (release.assets || []).find(a => a.name.toLowerCase().includes(pattern) && !a.name.toLowerCase().includes("checksum"));
        }

        if (!asset) return c.json({ error: "Asset not found in latest release" }, 404);

        let downloadUrl = asset.browser_download_url;

        // 3. Resolve Download URL natively for Private Repos (Traps the 302 Location header)
        if (token) {
            try {
                const rawRes = await $__native_fetch(asset.url, {
                    method: "GET",
                    headers: {
                        "Accept": "application/octet-stream",
                        "User-Agent": "ApexKit",
                        "Authorization": `Bearer ${token}`
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
        return c.json({ error: err.message }, 500);
    }
});

export default async function (req) {
    return app.fetch(req);
}