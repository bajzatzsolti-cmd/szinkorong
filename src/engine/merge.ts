// A szinkronizált haladás formája, ellenőrzése és összefésülése. A játék ÉS a szerver (server/src/worker.ts)
// is ezt használja, ezért függőség nélküli. Elvek (SPEC-2-profil-hang.md, A):
//  • haladás nem veszhet el: a két oldal kész lapjainak UNIÓJA marad meg, soha nem felülírás;
//  • a szülői beállításokból a frissebb nyer (settingsAt);
//  • „Haladás törlése”: a resetAt időpont előtt kész lapok minden készüléken eltűnnek (különben egy másik
//    készülék szinkronja visszahozná őket);
//  • a szerver csak ezt tárolja (és az utolsó módosítás idejét), semmi mást.

export interface DoneEntry {
  at: number;
  tries: number;
}

export interface SyncSettings {
  volume: number;
  disabled: string[];
}

export interface SyncPayload {
  done: Record<string, DoneEntry>;
  settings: SyncSettings;
  /** A szülői beállítások utolsó módosítása (ms). */
  settingsAt: number;
  /** Látott bemutatók (témakör-azonosítók). */
  demos: string[];
  /** Az utolsó „Haladás törlése” ideje (ms); 0 = sosem. */
  resetAt: number;
}

export const MAX_BODY_BYTES = 16 * 1024;
const TOPIC = /^[a-z]{2,12}$/;
const DONE_KEY = /^[a-z]{2,12}:(\d|1[0-4])$/;
/** 2024-01-01 előtti időpont nem lehet valódi (a játék 2026-ban készült). */
const MIN_TIME = Date.UTC(2024, 0, 1);

export const emptyPayload = (): SyncPayload => ({
  done: {},
  settings: { volume: 0.8, disabled: [] },
  settingsAt: 0,
  demos: [],
  resetAt: 0,
});

const isTime = (x: unknown, now: number): x is number =>
  typeof x === 'number' && Number.isFinite(x) && (x === 0 || (x >= MIN_TIME && x <= now + 86_400_000));

/**
 * Bemenet-ellenőrzés: csak a pontosan ilyen alakú adat megy át (ismeretlen mező, túl sok elem, rossz kulcs → hiba).
 * Visszaad: a megtisztított adat, vagy a hiba szövege.
 */
export function validatePayload(raw: unknown, now = Date.now()): { ok: true; value: SyncPayload } | { ok: false; error: string } {
  const fail = (error: string): { ok: false; error: string } => ({ ok: false, error });
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return fail('nem objektum');
  const o = raw as Record<string, unknown>;
  const allowed = new Set(['done', 'settings', 'settingsAt', 'demos', 'resetAt']);
  for (const k of Object.keys(o)) if (!allowed.has(k)) return fail(`ismeretlen mező: ${k}`);

  const done: Record<string, DoneEntry> = {};
  const d = o.done;
  if (!d || typeof d !== 'object' || Array.isArray(d)) return fail('done');
  const entries = Object.entries(d as Record<string, unknown>);
  if (entries.length > 400) return fail('done: túl sok elem');
  for (const [k, v] of entries) {
    if (!DONE_KEY.test(k)) return fail(`done kulcs: ${k}`);
    const e = v as Partial<DoneEntry> | null;
    if (!e || typeof e !== 'object' || !isTime(e.at, now) || e.at === 0) return fail(`done.at: ${k}`);
    if (typeof e.tries !== 'number' || !Number.isInteger(e.tries) || e.tries < 1 || e.tries > 999) return fail(`done.tries: ${k}`);
    if (Object.keys(e).length !== 2) return fail(`done mezők: ${k}`);
    done[k] = { at: e.at, tries: e.tries };
  }

  const s = o.settings as Partial<SyncSettings> | null;
  if (!s || typeof s !== 'object' || Array.isArray(s)) return fail('settings');
  if (Object.keys(s).some((k) => k !== 'volume' && k !== 'disabled')) return fail('settings mezők');
  if (typeof s.volume !== 'number' || !(s.volume >= 0 && s.volume <= 1)) return fail('settings.volume');
  if (!Array.isArray(s.disabled) || s.disabled.length > 30 || !s.disabled.every((x) => typeof x === 'string' && TOPIC.test(x))) {
    return fail('settings.disabled');
  }
  if (!Array.isArray(o.demos) || o.demos.length > 30 || !o.demos.every((x) => typeof x === 'string' && TOPIC.test(x))) return fail('demos');
  if (!isTime(o.settingsAt, now)) return fail('settingsAt');
  if (!isTime(o.resetAt, now)) return fail('resetAt');

  return {
    ok: true,
    value: {
      done,
      settings: { volume: s.volume, disabled: [...new Set(s.disabled)] },
      settingsAt: o.settingsAt as number,
      demos: [...new Set(o.demos as string[])],
      resetAt: o.resetAt as number,
    },
  };
}

/** Két állapot összefésülése (sorrendtől független): unió, a korábbi befejezéssel; a frissebb beállítás nyer. */
export function mergePayload(a: SyncPayload, b: SyncPayload): SyncPayload {
  const resetAt = Math.max(a.resetAt, b.resetAt);
  const done: Record<string, DoneEntry> = {};
  for (const src of [a.done, b.done]) {
    for (const [k, e] of Object.entries(src)) {
      if (e.at <= resetAt) continue;
      const prev = done[k];
      done[k] = prev ? { at: Math.min(prev.at, e.at), tries: Math.min(prev.tries, e.tries) } : { ...e };
    }
  }
  // Egyenlő időnél a „nagyobb” (szövegként) nyer, hogy az eredmény ne függjön a sorrendtől.
  const newer =
    a.settingsAt !== b.settingsAt
      ? a.settingsAt > b.settingsAt
        ? a
        : b
      : JSON.stringify(a.settings) >= JSON.stringify(b.settings)
        ? a
        : b;
  return {
    done: Object.fromEntries(Object.entries(done).sort(([x], [y]) => x.localeCompare(y))),
    settings: { volume: newer.settings.volume, disabled: [...newer.settings.disabled] },
    settingsAt: Math.max(a.settingsAt, b.settingsAt),
    demos: [...new Set([...a.demos, ...b.demos])].sort(),
    resetAt,
  };
}
