// Hang: feloldás első érintésre (iOS), hangeffektek, felolvasás.
// Felolvasás, ebben a sorrendben:
//  1. saját felvétel: content/audio/sajat/<azonosító>.mp3 vagy .m4a (a szülő által felvett, pl. betűhangok);
//  2. előre legenerált klip: src/assets/audio/<a szöveg lenyomata>.mp3 (scripts/hang-generalas.mjs);
//  3. tartalék: a készülék magyar hangja (speechSynthesis, hu-HU).
// A szövegek: content/audio/manifest.json. Egy hanganyag több klip sora is lehet: "sablon+szo-macska".
import manifest from '../../content/audio/manifest.json' with { type: 'json' };
import { clipKey } from './clip-key';

const TEXTS = manifest as Record<string, string>;

const basename = (p: string): string => p.slice(p.lastIndexOf('/') + 1).replace(/\.[^.]+$/, '');
const byName = (glob: Record<string, string>): Map<string, string> =>
  new Map(Object.entries(glob).map(([p, url]) => [basename(p), url]));

const GENERATED = byName(
  import.meta.glob('../assets/audio/*.mp3', { query: '?url', import: 'default', eager: true }) as Record<string, string>,
);
const OWN = byName(
  import.meta.glob('../../content/audio/sajat/*.{mp3,m4a}', { query: '?url', import: 'default', eager: true }) as Record<
    string,
    string
  >,
);

const SILENT_WAV =
  'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let volume = 0.8;
let speechEl: HTMLAudioElement | null = null;
let unlocked = false;
/** Minden új felolvasás új jegyet kap; a régi klipsor ebből tudja, hogy már nem ő szól. */
let playToken = 0;

export function setVolume(v: number): void {
  volume = Math.min(1, Math.max(0, v));
  if (master) master.gain.value = volume;
  if (speechEl) speechEl.volume = volume;
}

function audioContext(): AudioContext | null {
  if (ctx) return ctx;
  try {
    const Ctor: typeof AudioContext | undefined =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = volume;
    master.connect(ctx.destination);
  } catch {
    ctx = null;
  }
  return ctx;
}

/** iOS-en hang csak felhasználói érintésre indulhat: az első koppintáskor mindent feloldunk. */
export function unlockAudio(): void {
  if (unlocked) return;
  unlocked = true;
  try {
    const c = audioContext();
    if (c && c.state === 'suspended') void c.resume();
    speechEl = new Audio();
    speechEl.volume = volume;
    speechEl.src = SILENT_WAV;
    void speechEl.play().then(() => speechEl?.pause()).catch(() => undefined);
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance('');
      u.volume = 0;
      window.speechSynthesis.speak(u);
    }
  } catch {
    // A hang nélkül is használható a játék.
  }
}

function tone(freq: number, dur: number, start = 0, type: OscillatorType = 'sine', gain = 0.18): void {
  const c = audioContext();
  if (!c || !master) return;
  if (c.state === 'suspended') void c.resume();
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  o.connect(g);
  g.connect(master);
  const t0 = c.currentTime + start;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

export type Sfx = 'place' | 'ok' | 'bad' | 'tap';

/** Rövid hangeffektek (Web Audio, fájl nélkül): puha, nem ijesztő hangok. */
export function sfx(name: Sfx): void {
  switch (name) {
    case 'place':
      tone(587, 0.09, 0, 'sine', 0.2);
      tone(880, 0.06, 0.03, 'sine', 0.08);
      break;
    case 'tap':
      tone(660, 0.05, 0, 'sine', 0.12);
      break;
    case 'ok':
      [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.26, i * 0.1, 'triangle', 0.2));
      break;
    case 'bad':
      // Két lefelé lépő, lágy hang (nem berregés): „majdnem”.
      tone(392, 0.2, 0, 'triangle', 0.16);
      tone(330, 0.28, 0.16, 'triangle', 0.14);
      break;
  }
}

export function stopSpeech(): void {
  playToken++;
  try {
    if (speechEl) {
      speechEl.onended = null;
      speechEl.pause();
    }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  } catch {
    // nincs teendő
  }
}

/** Egy azonosító hangfájlja (saját felvétel vagy legenerált klip), ha van. */
export function clipUrl(id: string): string | undefined {
  const own = OWN.get(id);
  if (own) return own;
  const text = TEXTS[id];
  return text ? GENERATED.get(clipKey(text)) : undefined;
}

export type ClipSource = 'sajat' | 'generalt' | 'tartalek';

/** A Hangpróba oldalhoz: minden szöveg, és hogy honnan szól. */
export function clipList(): { id: string; text: string; source: ClipSource }[] {
  return Object.entries(TEXTS).map(([id, text]) => ({
    id,
    text,
    source: OWN.has(id) ? 'sajat' : GENERATED.has(clipKey(text)) ? 'generalt' : 'tartalek',
  }));
}

/**
 * Felolvas egy hanganyagot. A "+" jellel összefűzött azonosítók egymás után szólnak (pl. egy kérdéssablon
 * és egy szó). Ha bármelyik klip hiányzik, az egészet a készülék hangja olvassa fel, hogy ne legyen vegyes.
 */
export function say(seq: string): void {
  stopSpeech();
  const token = ++playToken;
  const ids = seq.split('+');
  const urls = ids.map(clipUrl);
  if (urls.every((u): u is string => !!u)) playUrls(urls, token, () => speakFallback(ids));
  else speakFallback(ids);
}

function playUrls(urls: string[], token: number, onFail: () => void): void {
  if (!speechEl) speechEl = new Audio();
  const el = speechEl;
  let i = 0;
  const next = (): void => {
    if (token !== playToken || i >= urls.length) return;
    el.src = urls[i++]!;
    el.volume = volume;
    el.onended = next;
    void el.play().catch(() => {
      if (token === playToken) onFail();
    });
  };
  next();
}

function speakFallback(ids: string[]): void {
  const text = ids
    .map((id) => TEXTS[id])
    .filter(Boolean)
    .join(' ');
  if (!text || !('speechSynthesis' in window)) return;
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'hu-HU';
    u.rate = 0.9;
    u.volume = volume;
    const voice = window.speechSynthesis.getVoices().find((v) => /^hu/i.test(v.lang));
    if (voice) u.voice = voice;
    window.speechSynthesis.speak(u);
  } catch {
    // nincs teendő
  }
}
