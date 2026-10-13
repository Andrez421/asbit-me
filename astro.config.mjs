// Astro configuration: static output, Tailwind 4 through its Vite plugin.
// The stylesheet is large on purpose (the design's effect layer is authored CSS);
// Astro emits it as a hashed, cacheable asset instead of inlining it per request.
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://asbit.me',
  vite: { plugins: [tailwindcss()] },
  build: { inlineStylesheets: 'auto' },
});
