// Haladás és beállítások tárolása, a játékosprofilonként (engine/profiles.ts). localStorage, minden hozzáférés
// try/catch-ben: privát módban, letiltott tárolóval vagy üres tárolóval is hibátlanul indul (memóriában marad meg).
// A szinkronizált profilok állapota a szerverrel összefésülődik (engine/sync.ts, engine/merge.ts).
import type { SyncPayload } from './merge';
import { activeStoreKey } from './profiles';
import type { TopicId } from './sheet';

export interface DoneEntry {
  /** Mikor lett kész (ms, Date.now). */
  at: number;
  /** Hány ellenőrzésből lett kész (1 = elsőre jó). */
  tries: number;
}

export interface Settings {
  /** 0..1 */
  volume: number;
  /** Kikapcsolt témakörök (szülői menü). */
  disabled: TopicId[];
}

export interface Store {
  v: 1;
  done: Record<string, DoneEntry>;
  settings: Settings;
  /** A beállítások utolsó módosítása (ms): a szinkronban a frissebb nyer. */
  settingsAt: number;
  /** Azok a témakörök, amelyeknek a bemutatóját a gyerek már látta. */
  demos: TopicId[];
  /** Az utolsó „Haladás törlése” ideje (ms): az előtte kész lapok a szinkronban sem jönnek vissza. */
  resetAt: number;
}

const defaults = (): Store => ({ v: 1, done: {}, settings: { volume: 0.8, disabled: [] }, settingsAt: 0, demos: [], resetAt: 0 });

let memory: Store | null = null;
let memoryKey = '';
/** Változáskor értesítendő (a szinkron ütemezéséhez). */
let onChange: (() => void) | null = null;
export const setProgressListener = (fn: (() => void) | null): void => void (onChange = fn);

function sanitize(raw: unknown): Store {
  const base = defaults();
  if (!raw || typeof raw !== 'object') return base;
  const o = raw as Partial<Store>;
  if (o.done && typeof o.done === 'object') {
    for (const [k, e] of Object.entries(o.done)) {
      if (e && typeof e.at === 'number' && typeof e.tries === 'number') base.done[k] = { at: e.at, tries: e.tries };
    }
  }
  const s = o.settings;
  if (s && typeof s === 'object') {
    if (typeof s.volume === 'number' && s.volume >= 0 && s.volume <= 1) base.settings.volume = s.volume;
    if (Array.isArray(s.disabled)) base.settings.disabled = s.disabled.filter((x) => typeof x === 'string');
  }
  if (Array.isArray(o.demos)) base.demos = o.demos.filter((x) => typeof x === 'string');
  if (typeof o.settingsAt === 'number') base.settingsAt = o.settingsAt;
  if (typeof o.resetAt === 'number') base.resetAt = o.resetAt;
  return base;
}

function load(): Store {
  const key = activeStoreKey();
  if (memory && memoryKey === key) return memory;
  let parsed: unknown = null;
  try {
    const text = localStorage.getItem(key);
    if (text) parsed = JSON.parse(text);
  } catch {
    // Nincs elérhető tároló, vagy sérült tartalom: üresen indulunk.
  }
  memory = sanitize(parsed);
  memoryKey = key;
  return memory;
}

function save(): void {
  try {
    localStorage.setItem(memoryKey || activeStoreKey(), JSON.stringify(load()));
  } catch {
    // A tárolás nem sikerült; a memóriában a munkamenet végéig megmarad.
  }
  onChange?.();
}

const doneKey = (topic: TopicId, index: number): string => `${topic}:${index}`;

export const isDone = (topic: TopicId, index: number): boolean => doneKey(topic, index) in load().done;

export function doneCount(topic: TopicId): number {
  const prefix = `${topic}:`;
  return Object.keys(load().done).filter((k) => k.startsWith(prefix)).length;
}

export function markDone(topic: TopicId, index: number, tries: number): void {
  const key = doneKey(topic, index);
  const prev = load().done[key];
  load().done[key] = prev ? { at: Math.min(prev.at, Date.now()), tries: Math.min(prev.tries, tries) } : { at: Date.now(), tries };
  save();
}

/** Első szabad (még nem kész) lap sorszáma; ha mind kész, az utolsó. */
export function nextUndone(topic: TopicId, count: number): number {
  for (let i = 0; i < count; i++) if (!isDone(topic, i)) return i;
  return count - 1;
}

export function resetProgress(): void {
  load().done = {};
  load().demos = [];
  load().resetAt = Date.now();
  save();
}

export const isDemoSeen = (topic: TopicId): boolean => load().demos.includes(topic);

export function markDemoSeen(topic: TopicId): void {
  if (!load().demos.includes(topic)) load().demos.push(topic);
  save();
}

export const getSettings = (): Settings => load().settings;

export function updateSettings(patch: Partial<Settings>): void {
  Object.assign(load().settings, patch);
  load().settingsAt = Date.now();
  save();
}

/** A szinkronhoz: a profil állapota a szerver formájában. */
export function exportPayload(): SyncPayload {
  const s = load();
  return {
    done: { ...s.done },
    settings: { volume: s.settings.volume, disabled: [...s.settings.disabled] },
    settingsAt: s.settingsAt,
    demos: [...s.demos],
    resetAt: s.resetAt,
  };
}

/** A szinkronhoz: az összefésült állapot visszaírása (értesítés nélkül, hogy ne induljon újabb szinkron). */
export function importPayload(p: SyncPayload): void {
  const s = load();
  s.done = { ...p.done };
  s.settings = { volume: p.settings.volume, disabled: [...p.settings.disabled] };
  s.settingsAt = p.settingsAt;
  s.demos = [...p.demos];
  s.resetAt = p.resetAt;
  try {
    localStorage.setItem(memoryKey, JSON.stringify(s));
  } catch {
    // memóriában marad
  }
}

/** Csak teszteléshez: a memóriában tartott állapot eldobása. */
export function _resetMemoryForTests(): void {
  memory = null;
  memoryKey = '';
}
