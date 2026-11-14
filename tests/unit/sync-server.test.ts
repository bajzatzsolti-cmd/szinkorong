// A szinkron-szerver (server/src/worker.ts) tesztje egy memóriabeli D1-utánzattal.
import { beforeEach, describe, expect, it } from 'vitest';
import { handle, type D1Like, type Env } from '../../server/src/worker';
import { emptyPayload, mergePayload, validatePayload, type SyncPayload } from '../../src/engine/merge';
import { codeProblem, nameProblem, normalizeName, profileId } from '../../src/engine/profile-id';

class FakeD1 implements D1Like {
  rows = new Map<string, { data: string; updated_at: number }>();
  prepare(sql: string) {
    const self = this;
    let args: unknown[] = [];
    const stmt = {
      bind(...values: unknown[]) {
        args = values;
        return stmt;
      },
      async first<T>() {
        const r = self.rows.get(args[0] as string);
        return (r ? { data: r.data, updated_at: r.updated_at } : null) as T | null;
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
const NOW = Date.UTC(2026, 10, 14, 12);
const ID = 'a'.repeat(64);
let db: FakeD1;
let env: Env;
const req = (method: string, body?: unknown, origin = ORIGIN, id = ID): Request =>
  new Request(`https://sync.example/v1/p/${id}`, {
    method,
    headers: { Origin: origin, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
const payload = (done: Record<string, { at: number; tries: number }>, extra: Partial<SyncPayload> = {}): SyncPayload => ({
  ...emptyPayload(),
  done,
  ...extra,
});

beforeEach(() => {
  db = new FakeD1();
  env = { DB: db, PEPPER: 'teszt-bors', ALLOWED_ORIGINS: ORIGIN };
});

describe('Szinkron-szerver', () => {
  it('idegen eredetű kérést elutasít (CORS csak a játék címéről)', async () => {
    expect((await handle(req('GET', undefined, 'https://gonosz.example'), env)).status).toBe(403);
    expect((await handle(new Request(`https://sync.example/v1/p/${ID}`), env)).status).toBe(403);
  });

  it('ismeretlen játékos: 404; mentés után letölthető; a tárolt kulcs NEM az azonosító (HMAC)', async () => {
    expect((await handle(req('GET'), env)).status).toBe(404);
    const p = payload({ 'arnyek:0': { at: NOW, tries: 1 } });
    const put = await handle(req('PUT', p), env);
    expect(put.status).toBe(200);
    expect([...db.rows.keys()][0]).not.toBe(ID);
    expect([...db.rows.keys()][0]).toMatch(/^[0-9a-f]{64}$/);
    const got = (await (await handle(req('GET'), env)).json()) as { payload: SyncPayload };
    expect(got.payload.done['arnyek:0']).toEqual({ at: NOW, tries: 1 });
  });

  it('két készülék: a kész lapok uniója marad meg, semmi nem vész el', async () => {
    await handle(req('PUT', payload({ 'arnyek:0': { at: NOW, tries: 2 }, 'minta:3': { at: NOW, tries: 1 } })), env);
    const res = await handle(req('PUT', payload({ 'arnyek:0': { at: NOW - 1000, tries: 1 }, 'par:5': { at: NOW, tries: 3 } })), env);
    const { payload: merged } = (await res.json()) as { payload: SyncPayload };
    expect(Object.keys(merged.done).sort()).toEqual(['arnyek:0', 'minta:3', 'par:5']);
    expect(merged.done['arnyek:0']).toEqual({ at: NOW - 1000, tries: 1 });
  });

  it('törlés után a szerveren nem marad adat', async () => {
    await handle(req('PUT', payload({ 'arnyek:0': { at: NOW, tries: 1 } })), env);
    expect(db.rows.size).toBe(1);
    expect((await handle(req('DELETE'), env)).status).toBe(204);
    expect(db.rows.size).toBe(0);
  });

  it('hibás bemenetet elutasít: ismeretlen mező, rossz kulcs, túl nagy törzs', async () => {
    expect((await handle(req('PUT', { ...payload({}), nev: 'Lárus' }), env)).status).toBe(400);
    expect((await handle(req('PUT', payload({ 'ARNYEK:0': { at: NOW, tries: 1 } })), env)).status).toBe(400);
    const big = payload(Object.fromEntries(Array.from({ length: 300 }, (_, i) => [`t${'x'.repeat(10)}:${i % 15}`, { at: NOW, tries: 1 }])));
    const huge = { ...big, demos: Array.from({ length: 30 }, () => 'a'.repeat(12)) };
    const res = await handle(req('PUT', { ...huge, settings: { volume: 0.5, disabled: [] }, padding: 'x'.repeat(20000) }), env);
    expect([400, 413]).toContain(res.status);
    expect((await handle(req('GET', undefined, ORIGIN, 'nem-hexa'), env)).status).toBe(404);
  });

  it('kérésszám-korlát: ha a korlát betelt, 429', async () => {
    env.LIMITER = { limit: async () => ({ success: false }) };
    expect((await handle(req('GET'), env)).status).toBe(429);
  });
});

describe('Összefésülés és törlés', () => {
  it('a „Haladás törlése” (resetAt) előtti lapokat egy másik készülék sem hozza vissza', () => {
    const old = payload({ 'arnyek:0': { at: NOW - 5000, tries: 1 } });
    const reset = payload({}, { resetAt: NOW - 1000 });
    const merged = mergePayload(old, reset);
    expect(merged.done).toEqual({});
    expect(mergePayload(reset, old)).toEqual(merged);
  });

  it('a frissebb szülői beállítás nyer, a sorrend nem számít', () => {
    const a = payload({}, { settings: { volume: 0.2, disabled: ['minta'] }, settingsAt: NOW - 10 });
    const b = payload({}, { settings: { volume: 0.9, disabled: [] }, settingsAt: NOW });
    expect(mergePayload(a, b).settings).toEqual({ volume: 0.9, disabled: [] });
    expect(mergePayload(b, a)).toEqual(mergePayload(a, b));
  });

  it('az ellenőrzés a jó adatot átengedi', () => {
    expect(validatePayload(payload({ 'arnyek:14': { at: NOW, tries: 1 } }), NOW).ok).toBe(true);
    expect(validatePayload(payload({ 'arnyek:15': { at: NOW, tries: 1 } }), NOW).ok).toBe(false);
  });
});

describe('Játékosnév és kód', () => {
  it('kis-nagybetű, ékezet, szóköz nem számít', async () => {
    expect(normalizeName('Láruska 22')).toBe('laruska22');
    expect(await profileId('Láruska 22', '1234')).toBe(await profileId('laruska22', '1234'));
    expect(await profileId('laruska22', '1234')).not.toBe(await profileId('laruska22', '1235'));
    expect(await profileId('laruska22', '1234')).toMatch(/^[0-9a-f]{64}$/);
  });

  it('a név szabálya: 3–20 karakter, betű és legalább 2 számjegy; a kód 4 számjegy', () => {
    expect(nameProblem('Laruska22')).toBeNull();
    expect(nameProblem('Laruska2')).not.toBeNull();
    expect(nameProblem('12345')).not.toBeNull();
    expect(nameProblem('ab')).not.toBeNull();
    expect(codeProblem('1234')).toBeNull();
    expect(codeProblem('12a4')).not.toBeNull();
  });
});
