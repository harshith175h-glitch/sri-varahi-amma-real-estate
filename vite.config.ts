import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(({ mode }) => {
  return {
    plugins: [react(), tailwindcss()],
    // Pin NODE_ENV to the Vite mode. Without this, a stray
    // `NODE_ENV=development` in .env/.env.local (or a host env var) makes the
    // production build bundle react-dom's DEVELOPMENT build: 643 kB instead of
    // 372 kB, plus React's runtime dev checks for every visitor.
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development'),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      // The app used to ship one 615 kB chunk containing every modal. Splitting
      // the vendor libraries lets the browser cache them separately, and the
      // heavy modals are additionally lazy-loaded in App.tsx.
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
            icons: ['lucide-react'],
            motion: ['motion'],
          },
        },
      },
      chunkSizeWarningLimit: 700,
    },
    server: {
      // Preview/host sandboxes proxy the dev server under their own hostname;
      // without this Vite answers 403 "Blocked request. This host is not
      // allowed." and the live preview never loads.
      allowedHosts: true as true,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    preview: {
      allowedHosts: true as true,
    },
  };
});
