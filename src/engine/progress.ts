// Haladás és beállítások tárolása. localStorage, minden hozzáférés try/catch-ben:
// privát módban, letiltott tárolóval vagy üres tárolóval is hibátlanul indul (memóriában marad meg).
import type { TopicId } from './sheet';

const KEY = 'szinkorong:v1';

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
  /** Azok a témakörök, amelyeknek a bemutatóját a gyerek már látta. */
  demos: TopicId[];
}

const defaults = (): Store => ({ v: 1, done: {}, settings: { volume: 0.8, disabled: [] }, demos: [] });

let memory: Store | null = null;

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
  return base;
}

function load(): Store {
  if (memory) return memory;
  let parsed: unknown = null;
  try {
    const text = localStorage.getItem(KEY);
    if (text) parsed = JSON.parse(text);
  } catch {
    // Nincs elérhető tároló, vagy sérült tartalom: üresen indulunk.
  }
  memory = sanitize(parsed);
  return memory;
}

function save(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(load()));
  } catch {
    // A tárolás nem sikerült; a memóriában a munkamenet végéig megmarad.
  }
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
  load().done[key] = { at: Date.now(), tries: prev ? Math.min(prev.tries, tries) : tries };
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
  save();
}

/** Csak teszteléshez: a memóriában tartott állapot eldobása. */
export function _resetMemoryForTests(): void {
  memory = null;
}
