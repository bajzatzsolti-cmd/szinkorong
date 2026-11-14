// Színkorong szinkron-szerver (Cloudflare Worker + D1). Egyetlen egyszerű API:
//   GET    /v1/p/<azonosító>   → { payload, updatedAt } vagy 404
//   PUT    /v1/p/<azonosító>   → a küldött és a tárolt haladás összefésülése (unió), a válasz az eredmény
//   DELETE /v1/p/<azonosító>   → 204, a szerveren nem marad adat
// Az azonosító a játékosnév + szülői kód SHA-256 lenyomata (64 hexa jegy); a szerver ezt még egyszer, a titkos
// PEPPER-rel lenyomatolja (HMAC), és csak így tárolja: egy adatbázis-szivárgásból sem fejthetők vissza a nevek.
// Tárolt adat: a lenyomat, a haladás, a szülői beállítások, az utolsó módosítás ideje. Semmi más (IP-cím, napló sincs).
import { MAX_BODY_BYTES, emptyPayload, mergePayload, validatePayload, type SyncPayload } from '../../src/engine/merge';

interface D1Statement {
  bind(...values: unknown[]): D1Statement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  run(): Promise<unknown>;
}
export interface D1Like {
  prepare(sql: string): D1Statement;
}
interface RateLimiter {
  limit(opts: { key: string }): Promise<{ success: boolean }>;
}
export interface Env {
  DB: D1Like;
  /** Titkos „bors” (wrangler secret put PEPPER): soha nincs a repóban. */
  PEPPER: string;
  /** Vesszővel elválasztott engedélyezett eredetek, pl. https://bajzatzsolti-cmd.github.io */
  ALLOWED_ORIGINS: string;
  /** Kérésszám-korlát (Workers Rate Limiting); ha nincs beállítva, nincs korlát. */
  LIMITER?: RateLimiter;
}

const ID = /^\/v1\/p\/([0-9a-f]{64})$/;

function cors(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(status: number, body: unknown, origin: string): Response {
  return new Response(body === null ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...cors(origin) },
  });
}

async function storageKey(pepper: string, id: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pepper), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(id));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function readStored(db: D1Like, key: string): Promise<{ payload: SyncPayload; updatedAt: number } | null> {
  const row = await db.prepare('SELECT data, updated_at FROM profiles WHERE id = ?').bind(key).first<{ data: string; updated_at: number }>();
  if (!row) return null;
  const v = validatePayload(JSON.parse(row.data));
  return { payload: v.ok ? v.value : emptyPayload(), updatedAt: row.updated_at };
}

export async function handle(request: Request, env: Env): Promise<Response> {
  const origin = request.headers.get('Origin') ?? '';
  const allowed = env.ALLOWED_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean);
  if (!allowed.includes(origin)) return new Response('Forbidden', { status: 403 });
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(origin) });

  const m = ID.exec(new URL(request.url).pathname);
  if (!m) return json(404, { error: 'nincs ilyen cím' }, origin);
  if (!env.PEPPER) return json(500, { error: 'a szerver nincs beállítva' }, origin);

  if (env.LIMITER) {
    // A korlát kulcsa az IP-cím; a Rate Limiting a Cloudflare oldalán, átmenetileg számol, mi nem tároljuk.
    const ip = request.headers.get('CF-Connecting-IP') ?? 'ismeretlen';
    const { success } = await env.LIMITER.limit({ key: ip });
    if (!success) return json(429, { error: 'túl sok kérés, próbáld később' }, origin);
  }

  const key = await storageKey(env.PEPPER, m[1]!);

  if (request.method === 'GET') {
    const stored = await readStored(env.DB, key);
    return stored ? json(200, stored, origin) : json(404, { error: 'nincs ilyen játékos' }, origin);
  }

  if (request.method === 'DELETE') {
    await env.DB.prepare('DELETE FROM profiles WHERE id = ?').bind(key).run();
    return json(204, null, origin);
  }

  if (request.method === 'PUT') {
    const len = Number(request.headers.get('Content-Length') ?? '0');
    if (len > MAX_BODY_BYTES) return json(413, { error: 'túl nagy' }, origin);
    const text = await request.text();
    if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) return json(413, { error: 'túl nagy' }, origin);
    let raw: unknown;
    try {
      raw = JSON.parse(text);
    } catch {
      return json(400, { error: 'hibás JSON' }, origin);
    }
    const v = validatePayload(raw);
    if (!v.ok) return json(400, { error: v.error }, origin);
    const stored = await readStored(env.DB, key);
    const merged = stored ? mergePayload(stored.payload, v.value) : v.value;
    const now = Date.now();
    await env.DB.prepare(
      'INSERT INTO profiles (id, data, updated_at) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at',
    )
      .bind(key, JSON.stringify(merged), now)
      .run();
    return json(200, { payload: merged, updatedAt: now }, origin);
  }

  return json(405, { error: 'nem támogatott' }, origin);
}

export default { fetch: (request: Request, env: Env): Promise<Response> => handle(request, env) };
