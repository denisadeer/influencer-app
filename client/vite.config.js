import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5716, // ✅ pevně daný port
    open: true,
    fs: {
      strict: false,
    },
    middlewareMode: false,
    proxy: {
      '/api': 'http://localhost:5713', // 🔁 TADY je důležité přesměrování na backend
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    // 🔽 Přidáno pro fallback v buildu (jen pokud budeš buildovat)
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  preview: {
    port: 4173,
    open: true,
  },
  base: '/',
});

