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
    // A hangfájlok mindig külön fájlok maradjanak (a nagyon rövid klipet se ágyazza be a kódba):
    // így pontos a hangcsomag mérete, és az offline gyorsítótár fájlonként kezeli őket.
    assetsInlineLimit: (file: string) => (/\.(mp3|m4a)$/.test(file) ? false : undefined),
  },
  plugins: [
    {
      // A build végén kiírja a hangcsomag méretét (a specifikáció elfogadási feltétele).
      name: 'szinkorong-hangcsomag',
      apply: 'build',
      writeBundle(_options, bundle) {
        const audio = Object.values(bundle).filter((f) => /\.(mp3|m4a)$/.test(f.fileName));
        const bytes = audio.reduce((s, f) => s + (f.type === 'asset' ? (typeof f.source === 'string' ? f.source.length : f.source.byteLength) : 0), 0);
        console.log(`\nHangcsomag: ${audio.length} fájl, ${(bytes / 1024 / 1024).toFixed(2)} MB`);
      },
    },
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
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,mp3,m4a,json,webmanifest}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: false,
        navigateFallback: 'index.html',
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
      },
    }),
  ],
});
