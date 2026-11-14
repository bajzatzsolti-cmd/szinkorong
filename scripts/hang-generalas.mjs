// A játék hangfájljainak gyártása a manifestből, megismételhetően:  npm run hang -- [kapcsolók]
//
//   --yes             nem kérdez rá (csak akkor, ha a becslést már jóváhagytad)
//   --max-kredit N    ennél nagyobb becslésnél meg sem kezdi (alapból 9000)
//   --csak a,b,c      csak ezek az azonosítók (pl. a 20 klipes próbakör); ilyenkor semmit nem töröl
//   --becsles         csak kiírja, mit gyártana és mennyibe kerülne
//
// Hogyan dolgozik:
//  • Egy fájl = egy szöveg: src/assets/audio/<a szöveg lenyomata>.mp3 (a játék ugyanígy keresi meg).
//  • Csak a változást gyártja: a lenyomatnapló (src/assets/audio/_lenyomatok.json) a szöveg + hang + modell +
//    beállítások lenyomatát őrzi; ami egyezik és megvan, kimarad; amire már semmi nem hivatkozik, törlődik.
//  • Kimenet: nyers 24 kHz-es hang → elején-végén csendvágás → egységes hangerő → kis mono MP3.
//  • A saját felvétellel (content/audio/sajat/<azonosító>.mp3|m4a) rendelkező azonosítókat kihagyja.
//  • A content/audio/rossz.json azonosítóit a „rossz_klipek” beállítással gyártja (más stabilitás, keretmondat).
//  • A kulcs a .env.local-ból jön (ELEVENLABS_API_KEY); a generálás dátumát klipenként naplózza (licenc).
import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, stat, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline/promises';
import { clipKey } from '../src/engine/clip-key.ts';
import { balance, client, ROOT } from './lib/elevenlabs.mjs';
import { pcm16ToFloat, trimAndNormalize } from './lib/audio-dsp.mjs';
import { encodeMp3 } from './lib/mp3.mjs';

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(`--${name}`);
const opt = (name) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : undefined;
};

const OUT = path.join(ROOT, 'src', 'assets', 'audio');
const LOG = path.join(OUT, '_lenyomatok.json');
const readJson = async (p, fallback) => (existsSync(p) ? JSON.parse(await readFile(p, 'utf8')) : fallback);

const manifest = await readJson(path.join(ROOT, 'content', 'audio', 'manifest.json'), {});
const cfg = await readJson(path.join(ROOT, 'content', 'audio', 'hang-beallitas.json'), null);
const bad = new Set((await readJson(path.join(ROOT, 'content', 'audio', 'rossz.json'), { azonositok: [] })).azonositok);
const log = await readJson(LOG, {});
if (!cfg?.hang?.azonosito) throw new Error('A content/audio/hang-beallitas.json-ban nincs kiválasztott hang.');

const ownDir = path.join(ROOT, 'content', 'audio', 'sajat');
const own = new Set(
  existsSync(ownDir) ? (await readdir(ownDir)).filter((f) => /\.(mp3|m4a)$/i.test(f)).map((f) => f.replace(/\.[^.]+$/, '')) : [],
);

const only = opt('csak') ? new Set(opt('csak').split(',').map((s) => s.trim())) : null;
const isWord = (t) => /^[\p{L}-]+$/u.test(t);
const cap = (s) => s[0].toLocaleUpperCase('hu') + s.slice(1);

/** Szövegenként: melyik azonosítók hivatkoznak rá, és milyen beállítással kell gyártani. */
const wanted = new Map();
for (const [id, text] of Object.entries(manifest)) {
  if (own.has(id)) continue;
  if (only && !only.has(id)) continue;
  const key = clipKey(text);
  const w = wanted.get(key) ?? { key, text, ids: [], bad: false };
  w.ids.push(id);
  w.bad ||= bad.has(id);
  wanted.set(key, w);
}

/** A tényleges kérés: szöveg + módszer + beállítás (ebből lesz a lenyomat is). */
function planFor(w) {
  const settings = w.bad ? cfg.rossz_klipek.beallitasok : cfg.beallitasok;
  const method = isWord(w.text) ? (w.bad ? cfg.rossz_klipek.egyszavas_modszer : cfg.egyszavas.modszer) : 'mondat';
  const sent = method === 'pont' ? `${cap(w.text)}.` : method === 'keret' ? `Ez egy ${w.text}.` : w.text;
  const fp = clipKey(
    JSON.stringify({ t: w.text, v: cfg.hang.azonosito, m: cfg.modell, l: cfg.nyelv, s: settings, method, o: cfg.kimenet }),
  );
  return { settings, method, sent, fp };
}

const todo = [];
for (const w of wanted.values()) {
  const p = planFor(w);
  const file = path.join(OUT, `${w.key}.mp3`);
  if (existsSync(file) && log[w.key]?.fp === p.fp) continue;
  todo.push({ ...w, ...p, file });
}

// Törlés: csak teljes futásnál, és csak a már semmihez nem tartozó fájlok.
const stale = [];
if (!only && existsSync(OUT)) {
  for (const f of await readdir(OUT)) {
    if (f.endsWith('.mp3') && !wanted.has(f.slice(0, -4))) stale.push(f);
  }
}

const chars = todo.reduce((s, t) => s + t.sent.length, 0);
const estimate = Math.ceil(chars * (cfg.kredit_per_karakter ?? 1));
const api = client();
const b0 = await balance(api);
console.log(`Hang: ${cfg.hang.nev} · modell: ${cfg.modell} · ${wanted.size} különböző szöveg a manifestben${only ? ' (szűrve)' : ''}`);
console.log(`Gyártandó: ${todo.length} klip, ${chars} karakter → becslés: ~${estimate} kredit · törlendő: ${stale.length} fájl`);
console.log(`Egyenleg: ${b0.remaining ?? '?'} kredit${b0.resetAt ? ` (újraindul: ${b0.resetAt.toISOString().slice(0, 10)})` : ''}`);
const max = Number(opt('max-kredit') ?? 9000);
if (estimate > max) {
  console.log(`A becslés több a megengedettnél (${max}). Nem kezdem el.`);
  process.exit(1);
}
if (flag('becsles') || (todo.length === 0 && stale.length === 0)) process.exit(0);
if (!flag('yes')) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ans = (await rl.question('Mehet? (i/n) ')).trim().toLowerCase();
  rl.close();
  if (ans !== 'i' && ans !== 'igen') process.exit(0);
}

await mkdir(OUT, { recursive: true });
for (const f of stale) {
  await unlink(path.join(OUT, f));
  delete log[f.slice(0, -4)];
}

const RATE = cfg.kimenet.mintaveteli_frekvencia;
let spent = 0;
let done = 0;
async function makeOne(t) {
  const body = { text: t.sent, model_id: cfg.modell, language_code: cfg.nyelv, voice_settings: t.settings };
  let pcm;
  let cost;
  if (t.method === 'keret') {
    const r = await api.ttsWithTimestamps(cfg.hang.azonosito, body, `pcm_${RATE}`);
    const all = pcm16ToFloat(r.bytes);
    const a = r.alignment;
    const s = t.sent.indexOf(t.text);
    const e = s + t.text.length - 1;
    const t0 = Math.max(0, a.character_start_times_seconds[s] - 0.04);
    const t1 = a.character_end_times_seconds[e] + 0.1;
    pcm = all.slice(Math.round(t0 * RATE), Math.round(t1 * RATE));
    cost = r.headers.get('character-cost');
  } else {
    const r = await api.tts(cfg.hang.azonosito, body, `pcm_${RATE}`);
    pcm = pcm16ToFloat(r.bytes);
    cost = r.headers.get('character-cost');
  }
  const { samples, stats } = trimAndNormalize(pcm, RATE, { targetRmsDb: cfg.kimenet.celhangero_db, peakDb: cfg.kimenet.csucs_db });
  if (stats.empty) throw new Error(`Üres hang: ${t.ids.join(', ')} („${t.text}”)`);
  await writeFile(t.file, await encodeMp3(samples, RATE, cfg.kimenet.kbps));
  spent += Number(cost ?? 0);
  log[t.key] = {
    fp: t.fp,
    szoveg: t.text,
    azonositok: t.ids,
    modszer: t.method,
    rossz: t.bad || undefined,
    hossz_mp: Number(stats.durationS.toFixed(2)),
    kredit: cost != null ? Number(cost) : undefined,
    generalva: new Date().toISOString(),
  };
  done++;
  if (done % 10 === 0 || done === todo.length) {
    await writeFile(LOG, JSON.stringify(sortKeys(log), null, 1) + '\n');
    process.stdout.write(`\r${done}/${todo.length} kész · ${spent} kredit`);
  }
}
const sortKeys = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));

// Legfeljebb 3 egyszerre (a Starter csomag párhuzamossági korlátja alatt).
const queue = todo.slice();
const failures = [];
await Promise.all(
  Array.from({ length: Math.min(3, queue.length) }, async () => {
    while (queue.length) {
      const t = queue.shift();
      try {
        await makeOne(t);
      } catch (e) {
        failures.push(`${t.ids.join(',')}: ${e.message}`);
      }
    }
  }),
);
await writeFile(LOG, JSON.stringify(sortKeys(log), null, 1) + '\n');

let bytes = 0;
let count = 0;
for (const f of await readdir(OUT)) {
  if (!f.endsWith('.mp3')) continue;
  bytes += (await stat(path.join(OUT, f))).size;
  count++;
}
const b1 = await balance(api);
console.log(`\nKész: ${done} klip gyártva, ${spent} kredit (válaszfejlécek szerint).`);
console.log(`Hangcsomag: ${count} fájl, ${(bytes / 1024 / 1024).toFixed(2)} MB · egyenleg: ${b1.remaining ?? '?'} kredit (késve frissülhet)`);
if (failures.length) {
  console.log(`Hibák (${failures.length}):\n  ${failures.join('\n  ')}`);
  process.exit(1);
}
