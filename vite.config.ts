import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// Relatív alapútvonal (./): így ugyanaz a build működik GitHub Pages projektoldalon
// (https://felhasznalo.github.io/szinkorong/) és saját tárhelyen is.
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string };

export default defineConfig({
  base: './',
  define: {
    // A szülői menüben látszik: melyik verzió fut (build időpontjával).
    __APP_VERSION__: JSON.stringify(`v${pkg.version} · ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`),
  },
  build: {
    target: 'es2020',
    sourcemap: false,
  },
  plugins: [
    VitePWA({
      // "prompt": az új verziót mi telepítjük, akkor, amikor a gyerek nincs lap közben
      // (lásd src/pwa.ts). Az első telepítéskor a clientsClaim miatt rögtön offline is megy.
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['icons/*.png', 'icons/*.svg'],
      manifest: {
        id: './',
        name: 'Színkorong',
        short_name: 'Színkorong',
        description: 'Iskolára hangoló logikai játék, olvasni nem kell hozzá.',
        lang: 'hu',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'any',
        background_color: '#3a4d7a',
        theme_color: '#3a4d7a',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,mp3,json,webmanifest}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: false,
        navigateFallback: 'index.html',
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
      },
    }),
  ],
});
