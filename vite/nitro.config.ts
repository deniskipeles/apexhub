import { defineNitroConfig } from 'nitropack/config';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { readFileSync, existsSync, unlinkSync } from 'node:fs';

config({ path: resolve(process.cwd(), '.env') });

const clientDir = resolve(process.cwd(), 'dist-client');
const indexPath = resolve(clientDir, 'index.html');
const indexHtmlContent = existsSync(indexPath) ? readFileSync(indexPath, 'utf-8') : '';

export default defineNitroConfig({
  srcDir: 'server',
  runtimeConfig: {
    apiUrl: process.env.VITE_API_URL || process.env.API_URL || 'http://127.0.0.1:5000',
    tenantId: process.env.VITE_TENANT_ID || process.env.TENANT_ID || '',
    indexHtml: indexHtmlContent
  },
  publicAssets: [
    {
      baseURL: '/',
      dir: clientDir,
      maxAge: 60 * 60 * 24 * 30
    }
  ],
  compressPublicAssets: false,
  routeRules: {
    '/assets/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
  },
  hooks: {
    'compiled': (nitro) => {
      // Remove static index.html from output so Cloudflare/Wrangler routes / through the worker
      const outIndex = resolve(nitro.options.output.publicDir, 'index.html');
      if (existsSync(outIndex)) {
        unlinkSync(outIndex);
        console.log('⚡ [Nitro] Removed static .output/public/index.html so / routes to middleware.');
      }
    }
  },
  compatibilityDate: '2026-09-01'
});