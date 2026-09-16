export default defineEventHandler(async (event) => {
  const path = event.path || '/';
  const cleanPath = path.split('?')[0];

  // 1. Let CDN / public handler manage static assets
  if (
    cleanPath.startsWith('/assets/') ||
    cleanPath.startsWith('/api/') ||
    /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|webp|json|map)$/i.test(cleanPath)
  ) {
    return;
  }

  // 2. Serve index.html for SPA routes
  const config = useRuntimeConfig(event);
  let html = (config.indexHtml as string) || '';

  if (!html) {
    try {
      const fs = await import('node:fs');
      const pathModule = await import('node:path');
      const candidatePaths = [
        pathModule.resolve(process.cwd(), 'dist-client/index.html'),
        pathModule.resolve(process.cwd(), 'dist/index.html')
      ];
      for (const p of candidatePaths) {
        if (fs.existsSync(p)) {
          html = fs.readFileSync(p, 'utf-8');
          break;
        }
      }
    } catch (_) {}
  }

  if (html) {
    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache'
      }
    });
  }

  return new Response('Cannot find index.html', { status: 404 });
});