import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig((_) => {
  // const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      // babel({ presets: [reactCompilerPreset()] }),
      // Generates gzip-compressed files during npm run build
      ((viteCompression as any).default || viteCompression)({
        algorithm: 'gzip',
        ext: '.gz',
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      host: '0.0.0.0',
      // ✅ Set to true to automatically allow ALL hostnames in development
      allowedHosts: true
    },
  };
});

