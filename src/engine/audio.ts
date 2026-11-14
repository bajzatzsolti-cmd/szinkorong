// Hang: feloldás első érintésre (iOS), hangeffektek, felolvasás.
// Felolvasás: előre legenerált mp3 (src/assets/audio/<azonosító>.mp3), ha az még nincs meg,
// tartalékként a böngésző magyar hangja (speechSynthesis, hu-HU). A szövegek: content/audio/manifest.json.
import manifest from '../../content/audio/manifest.json';

const clipUrls = import.meta.glob('../assets/audio/*.mp3', {
  query: '?url',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const SILENT_WAV =
  'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let volume = 0.8;
let speechEl: HTMLAudioElement | null = null;
let unlocked = false;

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
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

export type Sfx = 'place' | 'ok' | 'bad' | 'tap';

/** Rövid hangeffektek. (Ideiglenes, szintetizált hangok; a 4. sprintben véglegesek lesznek.) */
export function sfx(name: Sfx): void {
  switch (name) {
    case 'place':
      tone(520, 0.08, 0, 'sine', 0.2);
      break;
    case 'tap':
      tone(660, 0.05, 0, 'sine', 0.12);
      break;
    case 'ok':
      [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, i * 0.11, 'triangle', 0.2));
      break;
    case 'bad':
      tone(240, 0.22, 0, 'sawtooth', 0.12);
      tone(190, 0.28, 0.12, 'sawtooth', 0.1);
      break;
  }
}

export function stopSpeech(): void {
  try {
    speechEl?.pause();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  } catch {
    // nincs teendő
  }
}

/** Felolvas egy azonosítóval megadott szöveget (mp3, vagy tartalékként a böngésző magyar hangja). */
export function say(id: string): void {
  stopSpeech();
  const url = clipUrls[`../assets/audio/${id}.mp3`];
  if (url && speechEl) {
    speechEl.src = url;
    speechEl.volume = volume;
    void speechEl.play().catch(() => speakFallback(id));
    return;
  }
  speakFallback(id);
}

function speakFallback(id: string): void {
  const text = (manifest as Record<string, string>)[id];
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
