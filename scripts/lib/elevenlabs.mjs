// ElevenLabs API: kicsi, függőség nélküli kliens a hangscriptekhez.
// A kulcsot a projekt gyökerében lévő .env.local (vagy .env) fájlból, illetve környezeti változóból
// olvassa (ELEVENLABS_API_KEY). A kulcs soha nem kerül kiírásra, naplóba vagy a repóba (.gitignore).
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const API = 'https://api.elevenlabs.io';

/** Egyszerű .env-olvasó: KULCS=érték sorok, # megjegyzés, idézőjelek nélkül vagy azokkal. */
export function loadEnv() {
  const env = {};
  for (const name of ['.env', '.env.local']) {
    const p = path.join(ROOT, name);
    if (!existsSync(p)) continue;
    for (const raw of readFileSync(p, 'utf8').split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      const eq = line.indexOf('=');
      if (eq < 1) continue;
      const k = line.slice(0, eq).trim();
      const v = line.slice(eq + 1).trim().replace(/^(['"])(.*)\1$/, '$2');
      env[k] = v;
    }
  }
  return { ...env, ...Object.fromEntries(Object.entries(process.env).filter(([k]) => k.startsWith('ELEVENLABS_'))) };
}

export class ElevenLabsError extends Error {
  constructor(status, detail) {
    super(`ElevenLabs ${status}: ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`);
    this.status = status;
    this.detail = detail;
  }
}

export function client() {
  const env = loadEnv();
  const key = env.ELEVENLABS_API_KEY;
  if (!key) {
    throw new Error('Nincs ELEVENLABS_API_KEY: tedd a projekt gyökerébe egy .env.local fájlba (ELEVENLABS_API_KEY=...).');
  }
  const headers = { 'xi-api-key': key };

  async function request(method, url, body, accept = 'application/json') {
    for (let attempt = 0; ; attempt++) {
      const res = await fetch(API + url, {
        method,
        headers: { ...headers, accept, ...(body ? { 'content-type': 'application/json' } : {}) },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (res.status === 429 && attempt < 5) {
        await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
        continue;
      }
      if (!res.ok) {
        let detail;
        try {
          detail = (await res.json()).detail ?? res.statusText;
        } catch {
          detail = res.statusText;
        }
        throw new ElevenLabsError(res.status, detail);
      }
      return res;
    }
  }

  return {
    env,
    get: async (url) => (await request('GET', url)).json(),
    post: async (url, body) => (await request('POST', url, body)).json(),
    /** Szövegfelolvasás. Visszaad: nyers bájtok + a válasz fejlécei. */
    async tts(voiceId, body, outputFormat) {
      const q = new URLSearchParams({ output_format: outputFormat });
      const res = await request('POST', `/v1/text-to-speech/${encodeURIComponent(voiceId)}?${q}`, body, '*/*');
      return { bytes: Buffer.from(await res.arrayBuffer()), headers: res.headers };
    },
    /** Szövegfelolvasás betűnkénti időzítéssel (egy szó kivágásához keretmondatból). */
    async ttsWithTimestamps(voiceId, body, outputFormat) {
      const q = new URLSearchParams({ output_format: outputFormat });
      const res = await request('POST', `/v1/text-to-speech/${encodeURIComponent(voiceId)}/with-timestamps?${q}`, body);
      const j = await res.json();
      return { bytes: Buffer.from(j.audio_base64, 'base64'), alignment: j.alignment, headers: res.headers };
    },
  };
}

/** Kreditállapot (ha a kulcsnak van „User: Read” joga); különben null és az ok. */
export async function balance(api) {
  try {
    const s = await api.get('/v1/user/subscription');
    return {
      tier: s.tier,
      used: s.character_count,
      limit: s.character_limit,
      remaining: s.character_limit - s.character_count,
      resetAt: s.next_character_count_reset_unix ? new Date(s.next_character_count_reset_unix * 1000) : null,
    };
  } catch (e) {
    return { error: e instanceof ElevenLabsError ? `${e.status} ${JSON.stringify(e.detail)}` : String(e) };
  }
}
