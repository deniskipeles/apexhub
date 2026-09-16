import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [
      react(),
      tailwindcss(),
      ((viteCompression as any).default || viteCompression)({
        algorithm: 'gzip',
        ext: '.gz',
      })
    ],
    define: {
      'process.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL),
      'process.env.VITE_TENANT_ID': JSON.stringify(env.VITE_TENANT_ID),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      host: '0.0.0.0',
      allowedHosts: true
    },
    build: {
      outDir: 'dist-client',
      emptyOutDir: true,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('zustand')) {
                return 'react-vendor';
              }
              if (id.includes('lucide-react')) {
                return 'icons-vendor';
              }
              if (id.includes('highlight.js') || id.includes('marked') || id.includes('dompurify')) {
                return 'markdown-vendor';
              }
              if (id.includes('@apexkit/sdk')) {
                return 'apexkit-sdk';
              }
              return 'vendor';
            }
          }
        }
      }
    }
  };
});