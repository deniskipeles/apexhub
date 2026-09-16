const BOT_REGEX = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegram|discord|twitter|slack|linkedin|embedly|quora|pinterest|opengraph|lighthouse|postman|curl|wget|node-fetch|axios|got|python-requests|bytespider|google|yahoo|bing|msnbot|yandex|duckduckgo|baiduspider|headlesschrome|preview/i;

function getHeaderSafe(event: any, name: string): string {
  const lowerName = name.toLowerCase();
  try {
    if (event.request?.headers?.get) {
      return event.request.headers.get(lowerName) || '';
    }
    if (event.context?.cloudflare?.request?.headers?.get) {
      return event.context.cloudflare.request.headers.get(lowerName) || '';
    }
    if (event.headers?.get) {
      return event.headers.get(lowerName) || '';
    }
    const nodeHeaders = event.node?.req?.headers || event.req?.headers;
    if (nodeHeaders && typeof nodeHeaders === 'object') {
      return (nodeHeaders[lowerName] || nodeHeaders[name] || '') as string;
    }
  } catch (_) {}
  return '';
}

function resolveConfig(event: any) {
  const config = useRuntimeConfig(event);
  const cfEnv = event.context?.cloudflare?.env || {};

  const apiUrl = (
    cfEnv.VITE_API_URL ||
    cfEnv.API_URL ||
    config.apiUrl ||
    process.env.VITE_API_URL ||
    process.env.API_URL ||
    'http://127.0.0.1:5000'
  ).replace(/\/$/, '');

  const tenantId = (
    cfEnv.VITE_TENANT_ID ||
    cfEnv.TENANT_ID ||
    config.tenantId ||
    process.env.VITE_TENANT_ID ||
    process.env.TENANT_ID ||
    ''
  ).trim();

  let targetUrl = '';
  try {
    targetUrl = event.context?.cloudflare?.request?.url || event.request?.url || '';
  } catch (_) {}
  if (!targetUrl) {
    const host = getHeaderSafe(event, 'x-forwarded-host') || getHeaderSafe(event, 'host') || 'localhost';
    const proto = getHeaderSafe(event, 'x-forwarded-proto') || 'https';
    targetUrl = `${proto}://${host}${event.path || '/'}`;
  }

  return { apiUrl, tenantId, targetUrl };
}

export default defineEventHandler(async (event) => {
  const path = event.path || event.node?.req?.url || '/';

  // 1. Skip static assets
  if (
    path.startsWith('/assets/') ||
    path.startsWith('/api/') ||
    /\.(js|css|png|jpg|jpeg|svg|ico|json|map|woff|woff2)$/i.test(path)
  ) {
    return;
  }

  const userAgent = getHeaderSafe(event, 'user-agent');
  const isBot = BOT_REGEX.test(userAgent) || path.includes('bot=1') || path.includes('og=1');

  // 2. Pass through normal users to SPA
  if (!isBot) {
    return;
  }

  // 3. Dispatch to backend SEO crawler webhook for bots
  const { apiUrl, tenantId, targetUrl } = resolveConfig(event);
  const cleanPath = path.split('?')[0];

  const candidateUrls: string[] = [];
  if (tenantId) {
    candidateUrls.push(
      `${apiUrl}/tenant/${tenantId}/api/v1/webhook/seo-crawler?path=${encodeURIComponent(cleanPath)}&url=${encodeURIComponent(targetUrl)}`
    );
  }
  candidateUrls.push(
    `${apiUrl}/api/v1/webhook/seo-crawler?path=${encodeURIComponent(cleanPath)}&url=${encodeURIComponent(targetUrl)}`
  );

  for (const webhookUrl of candidateUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const apexRes = await fetch(webhookUrl, {
        headers: { Accept: 'text/html' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (apexRes.ok) {
        const html = await apexRes.text();
        return new Response(html, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-cache, no-store'
          }
        });
      }
    } catch (err: any) {
      console.warn(`[Crawler] Webhook failed (${webhookUrl}): ${err.message}`);
    }
  }

  return;
});