/** @type {import("../apexkit").FileMetadata} */
export const __fileMetadata__ = {
  "id": 31,
  "name": "api-files",
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

/**
 * Universal File Inspector & Reader
 * Automatically inspects ZIP archives or parses text/JSON/code files.
 */
app.all("/inspect", async (c) => {
    try {
        let filename = c.req.query("filename");
        let isZipHint = false;

        if (c.req.method === "POST") {
            const body = await c.req.json().catch(() => ({}));
            if (body.filename) filename = body.filename;
            if (body.is_zip !== undefined) isZipHint = Boolean(body.is_zip);
        }

        if (!filename) {
            return c.json({ error: "Missing 'filename' parameter" }, 400);
        }

        // 1. Fetch file Base64 payload from native storage
        const b64 = await $files.read(filename);
        if (!b64) {
            return c.json({ error: `File '${filename}' not found in storage` }, 404);
        }

        const isZip = isZipHint || filename.toLowerCase().endsWith(".zip");

        // 2. Handle ZIP Archive Inspection
        if (isZip) {
            try {
                const meta = await $zip.inspect(b64);
                return c.json({
                    success: true,
                    is_archive: true,
                    filename,
                    ...meta
                });
            } catch (zipErr) {
                return c.json({ error: `Failed to inspect archive: ${zipErr.message || zipErr}` }, 500);
            }
        }

        // 3. Handle Regular Text / Code / JSON Files
        const text = $util.base64Decode(b64);
        let parsedJson = null;

        try {
            parsedJson = JSON.parse(text);
        } catch {
            // Raw text, code (.js, .ts, .html, etc.)
        }

        return c.json({
            success: true,
            is_archive: false,
            filename,
            content: text,
            json: parsedJson
        });

    } catch (err) {
        return c.json({ error: err.message || err.toString() }, 500);
    }
});

/**
 * Direct file content reader
 */
app.all("/read", async (c) => {
    let filename = c.req.query("filename");
    if (c.req.method === "POST") {
        const body = await c.req.json().catch(() => ({}));
        if (body.filename) filename = body.filename;
    }

    if (!filename) return c.json({ error: "Missing 'filename'" }, 400);

    try {
        const b64 = await $files.read(filename);
        const text = $util.base64Decode(b64);
        try {
            return c.json(JSON.parse(text));
        } catch {
            return c.text(text);
        }
    } catch (err) {
        return c.json({ error: err.message || err.toString() }, 500);
    }
});

export default async function (req) {
    return app.fetch(req);
}