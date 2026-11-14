// Hangválasztási próbakör:  node scripts/hang-proba.mjs --round 1 --model eleven_v3 --voices "Zsklon,Aggie,Noémi" [--yes]
// Minden hanggal legenerálja ugyanazt a próbasort (külön klipenként), levágja a csendet, egységesíti a hangerőt,
// és hangonként egy összefűzött WAV-ot ír a .play/hangproba/ mappába (nem kerül a repóba).
// FOGYASZT KREDITET: futás előtt kiírja az egyenleget és a becslést, és --yes nélkül csak ennyit tesz.
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { balance, client, ROOT } from './lib/elevenlabs.mjs';
import { concat, pcm16ToFloat, silence, trimAndNormalize, wav } from './lib/audio-dsp.mjs';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => {
    if (a.startsWith('--')) acc.push([a.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true]);
    return acc;
  }, []),
);
const round = String(args.round ?? '1');
const model = String(args.model ?? 'eleven_v3');
const wanted = String(args.voices ?? 'Zsklon,Aggie,Noémi').split(',').map((s) => s.trim());
const RATE = 24000;

// A specifikáció próbasora (SPEC-2-profil-hang.md, B/1).
const LINES = [
  ['szamold', 'Számold meg! Hol van ugyanannyi?'],
  ['hangolo', 'Mondd ki hangosan a kép nevét! Melyik kezdődik ugyanazzal a hanggal?'],
  ['ugyes', 'Ügyes vagy!'],
  ['cica', 'A cica a szék alatt van.'],
  ['alma', 'alma'],
  ['cseresznye', 'cseresznye'],
  ['gyuru', 'gyűrű'],
  ['zsiraf', 'zsiráf'],
  ['tyuk', 'tyúk'],
];

// A gyűjteményi jelöltek (Hanggyűjtemény, magyar): név → [tulajdonos, hang-azonosító].
const LIBRARY = {
  Aggie: ['8b678d6bcd4305e880e7da2fa7a45c90e7614b6b1843272ad367f3ae14cb9413', 'Dme3o25EiC1DfrBQd73f'],
  'Noémi': ['f66869f39e6ac22d346df6606a0af8d13c078c778fcfc71bb6c55fa0775dd733', '3w3wekuD5gl2p2VY6XPZ'],
  Vivianna: ['b5960914999bec928c3c8a4689cd44603f6b4fd4ade3e3638e840718c34ac557', '9QppwToemG29A6UTSbwz'],
};

const api = client();
const chars = LINES.reduce((s, [, t]) => s + t.length, 0) * wanted.length;
const before = await balance(api);
console.log(`Modell: ${model} · hangok: ${wanted.join(', ')} · ${chars} karakter (becslés: ~${chars} kredit 1 kredit/karakterrel)`);
console.log(`Egyenleg most: ${before.remaining ?? '?'} kredit`);
if (!args.yes) {
  console.log('Próbafutás: --yes nélkül nem generálok.');
  process.exit(0);
}

// A hangok feloldása: a fiókban név szerint, ha nincs, a gyűjteményből hozzáadjuk.
const { voices: mine } = await api.get('/v2/voices?page_size=100');
const resolved = [];
for (const name of wanted) {
  let v = mine.find((m) => m.name === name || m.name.startsWith(`${name} `) || m.name.startsWith(`${name} -`));
  if (!v && LIBRARY[name]) {
    // A kulcsnak nincs (és nem is kell) „voices_write” joga: a gyűjteményi hangot közvetlenül az azonosítójával kérjük.
    v = { name, voice_id: LIBRARY[name][1] };
  }
  if (!v) throw new Error(`Nem találom a hangot: ${name}`);
  resolved.push(v);
}

const outDir = path.join(ROOT, '.play', 'hangproba', `kor${round}`);
await mkdir(outDir, { recursive: true });
const report = [];
for (const v of resolved) {
  const parts = [];
  for (const [id, text] of LINES) {
    const body = {
      text,
      model_id: model,
      language_code: 'hu',
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    };
    const { bytes, headers } = await api.tts(v.voice_id, body, `pcm_${RATE}`);
    const { samples, stats } = trimAndNormalize(pcm16ToFloat(bytes), RATE);
    await writeFile(path.join(outDir, `${v.name}-${id}.wav`), wav(samples, RATE));
    parts.push(samples, silence(RATE, 0.9));
    const cost = headers.get('character-cost') ?? headers.get('x-character-count');
    report.push({ voice: v.name, id, text, chars: text.length, cost, ...stats });
    process.stdout.write('.');
  }
  await writeFile(path.join(outDir, `${v.name}-proba.wav`), wav(concat(parts), RATE));
}
const after = await balance(api);
await writeFile(path.join(outDir, 'jelentes.json'), JSON.stringify({ model, before, after, report }, null, 2));
const used = before.remaining != null && after.remaining != null ? before.remaining - after.remaining : '?';
console.log(`\nKész: ${outDir}`);
console.log(`Felhasznált kredit: ${used} (${chars} karakter) · maradt: ${after.remaining ?? '?'}`);
for (const r of report) console.log(`  ${r.voice} ${r.id}: ${r.durationS?.toFixed(2)} s, költség-fejléc: ${r.cost ?? '–'}`);
