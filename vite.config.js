import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    base: './',
    plugins: [vue(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      minify: mode === 'production' ? 'terser' : false, // Use Terser only in production
      terserOptions: mode === 'production' ? {
        compress: {
          drop_console: true, // Remove all console.* calls in production
        },
      } : {},
    },
  };
});