import { expect, test, type Page, type Route } from '@playwright/test';
import { skipDemos } from './helpers';

const openParent = async (page: Page): Promise<void> => {
  const b = (await page.locator('.parent-btn').boundingBox())!;
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(3300);
  await page.mouse.up();
  await expect(page.locator('[data-testid="parent-panel"]')).toBeVisible();
};

test.describe('első indítás', () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  test('új telepítésnél egyszer megjelenik a (kihagyható) játékosnév-kártya, utána többé nem', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-testid="welcome"]')).toBeVisible();
    await page.locator('[data-act="w-skip"]').click();
    await expect(page.locator('[data-testid="welcome"]')).toHaveCount(0);
    await page.reload();
    await expect(page.locator('.tile').first()).toBeVisible();
    await expect(page.locator('[data-testid="welcome"]')).toHaveCount(0);
  });
});

test('játékosok: új (helyi) játékos, saját haladás, visszaváltás; a régi haladás megmarad', async ({ page }) => {
  await skipDemos(page);
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('egyszer')) {
      sessionStorage.setItem('egyszer', '1');
      const s = JSON.parse(localStorage.getItem('szinkorong:v1') ?? '{}');
      s.done = { 'minta:0': { at: Date.now(), tries: 1 } };
      localStorage.setItem('szinkorong:v1', JSON.stringify(s));
    }
  });
  await page.goto('/');
  await expect(page.locator('.tile[data-topic="minta"] .dots i.on')).toHaveCount(1);

  await openParent(page);
  await page.locator('[data-act="players"]').click();
  await page.locator('[data-act="p-new"]').click();
  await page.locator('[data-f="name"]').fill('Tesó1'); // 1 számjegy: hibás
  await page.locator('[data-act="p-save"]').click();
  await expect(page.locator('.pmsg')).toContainText('2 számjegy');
  await page.locator('[data-f="name"]').fill('Tesó12');
  await page.locator('[data-act="p-save"]').click();
  await expect(page.locator('.pnote').first()).toContainText('Tesó12');
  await page.screenshot({ path: `screenshots/${test.info().project.name}-jatekosok.png` });
  await page.locator('[data-act="p-back"]').click();
  await page.locator('[data-act="close"]').click();
  // Az új játékosnak még nincs kész lapja.
  await expect(page.locator('.tile[data-topic="minta"] .dots i.on')).toHaveCount(0);

  // Vissza az alapprofilra: a régi haladás megvan.
  await openParent(page);
  await page.locator('[data-act="players"]').click();
  await page.locator('input[name="pprof"][value="helyi"]').check();
  await page.locator('[data-act="p-back"]').click();
  await page.locator('[data-act="close"]').click();
  await expect(page.locator('.tile[data-topic="minta"] .dots i.on')).toHaveCount(1);
});

test.describe('szinkron (utánzott szerverrel)', () => {
  // A szervizmunkás (offline gyorsítótár) a Playwright útvonal-utánzása elé állna: itt kikapcsoljuk.
  test.use({ serviceWorkers: 'block' });
test('szinkron: bekapcsolás névvel + kóddal, a hálózatra csak a lenyomat és a haladás megy, törléskor a szerverről is törlődik', async ({ page }) => {
  // Utánzott szerver: a valódi címre menő kéréseket a teszt szolgálja ki (memóriában).
  const store = new Map<string, string>();
  const seen: { method: string; url: string; body: string }[] = [];
  const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
  await page.route('https://szinkorong-sync.szinkorong.workers.dev/**', async (route: Route) => {
    const req = route.request();
    const id = req.url().split('/').pop()!;
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
    seen.push({ method: req.method(), url: req.url(), body: req.postData() ?? '' });
    if (req.method() === 'GET') {
      const v = store.get(id);
      return route.fulfill(v ? { status: 200, headers: cors, contentType: 'application/json', body: JSON.stringify({ payload: JSON.parse(v), updatedAt: 1 }) } : { status: 404, headers: cors, body: '{}' });
    }
    if (req.method() === 'PUT') {
      store.set(id, req.postData()!);
      return route.fulfill({ status: 200, headers: cors, contentType: 'application/json', body: JSON.stringify({ payload: JSON.parse(req.postData()!), updatedAt: 2 }) });
    }
    store.delete(id);
    return route.fulfill({ status: 204, headers: cors });
  });

  await skipDemos(page);
  await page.goto('/');
  // Indításkor (szinkron nélküli profil) semmi nem megy ki.
  await page.waitForTimeout(500);
  expect(seen).toEqual([]);

  await openParent(page);
  await page.locator('[data-act="players"]').click();
  await page.locator('[data-act="p-attach"]').click();
  await page.locator('[data-f="name"]').fill('Laruska22');
  await page.locator('[data-f="code"]').fill('4321');
  await page.locator('[data-act="p-save"]').click();
  await expect(page.locator('.pmsg')).toContainText('új játékos lesz');
  await page.locator('[data-act="p-yes"]').click();
  await expect(page.locator('.pmsg')).toContainText('más készüléken is folytathatja');
  await expect(page.locator('.pnote').first()).toContainText('szinkronizált');

  expect(seen.map((r) => r.method)).toEqual(['GET', 'PUT']);
  for (const r of seen) {
    expect(r.url).toMatch(/\/v1\/p\/[0-9a-f]{64}$/);
    expect((r.url + r.body).toLowerCase()).not.toContain('laruska');
    expect(r.url + r.body).not.toContain('4321');
  }
  expect(Object.keys(JSON.parse(seen[1]!.body)).sort()).toEqual(['demos', 'done', 'resetAt', 'settings', 'settingsAt']);
  expect(store.size).toBe(1);

  // Játékos törlése: kétlépcsős, a szerverről is törlődik.
  await page.locator('[data-act="p-del"]').click();
  await page.locator('[data-act="p-del"]').click();
  await expect(page.locator('.pmsg')).toContainText('Törölve');
  expect(store.size).toBe(0);
});
});
