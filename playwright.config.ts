import { defineConfig } from '@playwright/test';

// iPad mini (6. gen.) CSS-méretei: 744 × 1133 álló, 1133 × 744 fekvő.
// Figyelem: a Playwright WebKit nem azonos az iOS Safari standalone móddal;
// az elrendezést és a logikát fedi le, a valódi iPad-próba a 6. sprint része.
const common = {
  browserName: 'webkit' as const,
  deviceScaleFactor: 2,
  hasTouch: true,
  isMobile: true,
};

export default defineConfig({
  testDir: 'tests/e2e',
  outputDir: 'test-results',
  timeout: 60_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  // reducedMotion: a pulzáló elemek (következő lap, kijelölt korong) miatt a Playwright
  // sosem látná „megállónak” a gombot; a CSS a csökkentett mozgásnál kikapcsolja a pulzálást.
  use: { baseURL: 'http://localhost:4173', trace: 'off', reducedMotion: 'reduce' },
  projects: [
    { name: 'ipad-mini-allo', use: { ...common, viewport: { width: 744, height: 1133 } } },
    { name: 'ipad-mini-fekvo', use: { ...common, viewport: { width: 1133, height: 744 } } },
  ],
  webServer: {
    // A buildet előbb le kell futtatni (npm run build); a teszt a kész dist-et szolgálja ki.
    command: 'npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
