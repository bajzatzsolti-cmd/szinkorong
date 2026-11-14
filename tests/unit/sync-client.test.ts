// A játék szinkronja (engine/sync.ts) a valódi szerverkóddal (server/src/worker.ts), memóriabeli adatbázison.
// Két készüléket játszunk el: a memóriában tartott állapotot eldobjuk, mintha másik iPad lenne.
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/config', () => ({ SYNC_URL: 'https://sync.test' }));

import { handle, type D1Like } from '../../server/src/worker';
import { profileId } from '../../src/engine/profile-id';
import { _resetProfilesForTests, activeProfile, createProfile, switchProfile } from '../../src/engine/profiles';
import { _resetMemoryForTests, exportPayload, importPayload, isDone, markDone, resetProgress } from '../../src/engine/progress';
import { remoteDelete, remoteGet, syncNow } from '../../src/engine/sync';

class FakeD1 implements D1Like {
  rows = new Map<string, { data: string; updated_at: number }>();
  prepare(sql: string) {
    const self = this;
    let args: unknown[] = [];
    const stmt = {
      bind(...v: unknown[]) {
        args = v;
        return stmt;
      },
      async first<T>() {
        return (self.rows.get(args[0] as string) ?? null) as T | null;
      },
      async run() {
        if (sql.startsWith('DELETE')) self.rows.delete(args[0] as string);
        else self.rows.set(args[0] as string, { data: args[1] as string, updated_at: args[2] as number });
        return {};
      },
    };
    return stmt;
  }
}

const ORIGIN = 'https://bajzatzsolti-cmd.github.io';
let db: FakeD1;
let online = true;
const sent: { url: string; body: string }[] = [];

beforeEach(() => {
  db = new FakeD1();
  online = true;
  sent.length = 0;
  vi.stubGlobal('fetch', async (input: string, init: RequestInit = {}) => {
    if (!online) throw new TypeError('Failed to fetch');
    sent.push({ url: input, body: String(init.body ?? '') });
    // A böngésző ugyanígy hozzátenné az Origin fejlécet.
    const req = new Request(input, { ...init, headers: { ...(init.headers as Record<string, string>), Origin: ORIGIN } });
    return handle(req, { DB: db, PEPPER: 'teszt-bors', ALLOWED_ORIGINS: ORIGIN });
  });
  newDevice();
});

/** Mintha másik készülék lenne: üres memória, üres profil-nyilvántartás. */
function newDevice(): void {
  _resetMemoryForTests();
  _resetProfilesForTests();
}

async function join(name: string, code: string): Promise<void> {
  const id = await profileId(name, code);
  const remote = await remoteGet(id);
  const p = createProfile(name, id);
  switchProfile(p.local);
  if (remote) importPayload(remote);
}

describe('Szinkron két készülék között', () => {
  it('a kész lapok mindkét irányban megjelennek (unió)', async () => {
    // A készülék
    await join('Laruska22', '4321');
    markDone('arnyek', 0, 1);
    await syncNow();
    const deviceA = exportPayload();

    // B készülék: ugyanaz a név és kód
    newDevice();
    await join('laruska 22', '4321');
    expect(isDone('arnyek', 0)).toBe(true);
    markDone('minta', 2, 1);
    await syncNow();

    // Vissza A-ra: szinkron után a B-n kész lap is megvan
    newDevice();
    const id = await profileId('Laruska22', '4321');
    switchProfile(createProfile('Laruska22', id).local);
    importPayload(deviceA);
    await syncNow();
    expect(isDone('arnyek', 0)).toBe(true);
    expect(isDone('minta', 2)).toBe(true);
  });

  it('repülő módban játszva, majd netre visszatérve a haladás feltöltődik', async () => {
    await join('Tesó12', '1111');
    online = false;
    markDone('par', 4, 2);
    await syncNow();
    expect(activeProfile().pending).toBe(true);
    online = true;
    await syncNow();
    expect(activeProfile().pending).toBe(false);
    const remote = await remoteGet(await profileId('Tesó12', '1111'));
    expect(remote?.done['par:4']).toBeTruthy();
  });

  it('a hálózaton csak az azonosító (lenyomat) és a haladás megy ki: a név és a kód soha', async () => {
    await join('Laruska22', '4321');
    markDone('arnyek', 3, 1);
    await syncNow();
    for (const r of sent) {
      expect(r.url).toMatch(/^https:\/\/sync\.test\/v1\/p\/[0-9a-f]{64}$/);
      expect((r.url + r.body).toLowerCase()).not.toContain('laruska');
      expect(r.url + r.body).not.toContain('4321');
      if (r.body) expect(Object.keys(JSON.parse(r.body)).sort()).toEqual(['demos', 'done', 'resetAt', 'settings', 'settingsAt']);
    }
  });

  it('profil törlése után a szerveren nem marad adat', async () => {
    await join('Laruska22', '4321');
    markDone('arnyek', 0, 1);
    await syncNow();
    expect(db.rows.size).toBe(1);
    await remoteDelete(activeProfile().sync!);
    expect(db.rows.size).toBe(0);
  });

  it('a „Haladás törlése” egy másik készülék régi lapjait sem engedi vissza', async () => {
    await join('Laruska22', '4321');
    markDone('arnyek', 0, 1);
    await syncNow();
    const old = exportPayload();
    await new Promise((r) => setTimeout(r, 5));
    resetProgress();
    await syncNow();
    // Egy másik készülék a régi állapottal szinkronizál
    newDevice();
    const id = await profileId('Laruska22', '4321');
    switchProfile(createProfile('Laruska22', id).local);
    importPayload(old);
    await syncNow();
    expect(isDone('arnyek', 0)).toBe(false);
  });
});
