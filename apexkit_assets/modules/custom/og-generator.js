/** @type {import("../../apexkit").FileMetadata} */
export const __fileMetadata__ = {
  "id": 110,
  "name": "og-generator",
  "extension": "js",
  "target_collection": null,
  "type": "custom:module",
  "path": "./modules/custom/",
  "trigger_type": "manual",
  "active": true,
  "visibility": "private"
};

const CACHE_SUBDIR = "og_cache";
const CACHE_VERSION = "v1";

function escapeXml(str = '') {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function buildApexOgSvg(options = {}) {
  const {
    category = "APEXKIT RUNTIME",
    title = "Extreme & Excellent Backend Platform",
    description = "Single-node vertical scale runtime powered by Rust, multi-DB SQLite, and dual vector search.",
    author = "ApexTeam",
    accentColor = "#6366f1",
    badge = "v0.3.0",
    tags = ["Rust", "SQLite", "Vectors"],
    codeSnippet = ""
  } = options;

  const safeTitle = escapeXml(title.length > 50 ? title.slice(0, 48) + "..." : title);
  const safeDesc = escapeXml(description.length > 115 ? description.slice(0, 112) + "..." : description);
  const safeCat = escapeXml(category.toUpperCase());
  const safeAuthor = escapeXml(author);
  const safeBadge = escapeXml(badge);

  const tagsSvg = (Array.isArray(tags) ? tags : []).slice(0, 4).map((t, idx) => {
    const safeTag = escapeXml(t.startsWith("#") ? t : `#${t}`);
    return `
      <rect x="${idx * 115}" y="0" width="105" height="28" rx="14" fill="#0f172a" stroke="#334155" stroke-width="1"/>
      <text x="${idx * 115 + 52}" y="18" font-family="monospace" font-size="11" font-weight="700" fill="${accentColor}" text-anchor="middle">${safeTag}</text>
    `;
  }).join("");

  let codeRowsSvg = "";
  if (codeSnippet) {
    const lines = codeSnippet.trim().split("\n").slice(0, 4);
    codeRowsSvg = lines.map((line, i) => `
      <text x="120" y="${330 + i * 26}" font-family="monospace" font-size="13" fill="#a5b4fc">${escapeXml(line)}</text>
    `).join("");
  }

  return `
  <svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
        <stop stop-color="#090d16"/>
        <stop offset="0.5" stop-color="#0f172a"/>
        <stop offset="1" stop-color="#05080e"/>
      </linearGradient>

      <radialGradient id="glowTop" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1050 100) scale(600)">
        <stop stop-color="${accentColor}" stop-opacity="0.25"/>
        <stop offset="1" stop-color="${accentColor}" stop-opacity="0"/>
      </radialGradient>

      <radialGradient id="glowBottom" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(150 550) scale(500)">
        <stop stop-color="#10b981" stop-opacity="0.16"/>
        <stop offset="1" stop-color="#10b981" stop-opacity="0"/>
      </radialGradient>

      <filter id="cardShadow" x="-5%" y="-5%" width="110%" height="115%">
        <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#000000" flood-opacity="0.6"/>
      </filter>
    </defs>

    <rect width="1200" height="630" fill="url(#bgGrad)"/>
    <rect width="1200" height="630" fill="url(#glowTop)"/>
    <rect width="1200" height="630" fill="url(#glowBottom)"/>

    <g transform="translate(90, 80)">
      <rect width="180" height="30" rx="15" fill="#1e1b4b" stroke="${accentColor}" stroke-width="1.5"/>
      <circle cx="16" cy="15" r="4.5" fill="${accentColor}"/>
      <text x="30" y="19" font-family="sans-serif" font-size="11" font-weight="800" fill="#e0e7ff" letter-spacing="1">${safeCat}</text>

      <rect x="200" y="0" width="80" height="30" rx="8" fill="#10b981" opacity="0.2"/>
      <text x="240" y="19" font-family="monospace" font-size="12" font-weight="800" fill="#34d399" text-anchor="middle">${safeBadge}</text>

      <text x="0" y="85" font-family="sans-serif" font-size="46" font-weight="900" fill="#ffffff" letter-spacing="-0.8">${safeTitle}</text>
      <text x="0" y="128" font-family="sans-serif" font-size="18" font-weight="500" fill="#94a3b8">${safeDesc}</text>
    </g>

    <g transform="translate(90, 260)" filter="url(#cardShadow)">
      <rect width="1020" height="210" rx="20" fill="#0d111c" stroke="#1e293b" stroke-width="2"/>
      <path d="M0 20 C0 9, 9 0, 20 0 L1000 0 C1011 0, 1020 9, 1020 20 L1020 40 L0 40 Z" fill="#151b2d"/>
      <circle cx="24" cy="20" r="5.5" fill="#ef4444"/>
      <circle cx="42" cy="20" r="5.5" fill="#eab308"/>
      <circle cx="60" cy="20" r="5.5" fill="#22c55e"/>
      <text x="90" y="25" font-family="monospace" font-size="12" font-weight="600" fill="#94a3b8">runtime.rs // apexkit</text>
      <line x1="0" y1="40" x2="1020" y2="40" stroke="#1e293b" stroke-width="1.5"/>

      <g transform="translate(40, 140)">
        ${tagsSvg}
      </g>
    </g>

    ${codeRowsSvg}

    <g transform="translate(90, 545)">
      <text x="0" y="24" font-family="sans-serif" font-size="12" font-weight="700" fill="#64748b" letter-spacing="0.5">AUTHOR: <tspan fill="#f1f5f9">${safeAuthor}</tspan></text>
      <text x="320" y="24" font-family="sans-serif" font-size="12" font-weight="700" fill="#64748b" letter-spacing="0.5">SPEED: <tspan fill="#34d399">&lt; 5ms COLD START</tspan></text>
      
      <rect x="860" y="4" width="160" height="28" rx="14" fill="#1e1b4b" stroke="${accentColor}" stroke-width="1"/>
      <text x="940" y="22" font-family="sans-serif" font-size="10" font-weight="800" fill="#c7d2fe" text-anchor="middle" letter-spacing="0.8">APEXKIT HUB</text>
    </g>
  </svg>
  `.trim();
}

export async function generateApexOgImage(options = {}) {
  const {
    category = "APEXKIT RUNTIME",
    title = "",
    description = "",
    author = "ApexTeam",
    accentColor = "#6366f1",
    badge = "v0.3.0",
    tags = [],
    codeSnippet = "",
    forceFresh = false
  } = options;

  const rawKeyData = `${CACHE_VERSION}|${category}|${title}|${description}|${badge}|${tags.join(",")}|${author}`;
  const cacheKey = $util.hash(rawKeyData, "sha256");
  const cachePath = `${CACHE_SUBDIR}/apex_${cacheKey}.webp`;

  // 1. Return from disk cache if exists
  if (!forceFresh && typeof $fs?.exists === "function") {
    try {
      const exists = await $fs.exists(cachePath);
      if (exists) {
        const b64 = typeof $fs.readBytes === "function" ? await $fs.readBytes(cachePath) : await $fs.read(cachePath);
        if (b64) {
          const buffer = $util.base64DecodeBuffer(b64);
          return { buffer, base64: b64, mimeType: "image/webp", cacheKey };
        }
      }
    } catch (_) {}
  }

  // 2. Generate SVG markup
  const svgText = buildApexOgSvg({
    category,
    title,
    description,
    author,
    accentColor,
    badge,
    tags,
    codeSnippet
  });

  // 3. Resolve base URL safely
  let localAppUrl = "";
  try {
    localAppUrl = await $env.get("LOCAL_APP_URL");
  } catch (_) {}
  if (!localAppUrl) {
    try {
      localAppUrl = await $env.get("LOCAL_BASE_URL");
    } catch (_) {}
  }
  if (!localAppUrl) {
    localAppUrl = $env.LOCAL_APP_URL || $env.BASE_URL || "http://127.0.0.1:5000";
  }

  const svgB64 = $util.base64Encode(svgText);
  const renderUrl = `${localAppUrl.replace(/\/$/, "")}/api/v1/storage/files/opengraph?template=${encodeURIComponent(svgB64)}&format=webp&quality=90&data=[]`;

  const renderRes = await fetch(renderUrl);
  if (!renderRes.ok) {
    const errText = await renderRes.text().catch(() => "");
    throw new Error(`OpenGraph render failed (HTTP ${renderRes.status}): ${errText}`);
  }

  const arrayBuffer = await renderRes.arrayBuffer();
  const outB64 = $util.base64EncodeBuffer(arrayBuffer);

  // 4. Save to disk cache
  try {
    if (typeof $fs?.mkdir === "function") await $fs.mkdir(CACHE_SUBDIR);
    if (typeof $fs?.writeBytes === "function") await $fs.writeBytes(cachePath, outB64);
  } catch (_) {}

  return { buffer: arrayBuffer, base64: outB64, mimeType: "image/webp", cacheKey };
}