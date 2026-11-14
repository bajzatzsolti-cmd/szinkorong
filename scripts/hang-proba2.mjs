// Hangválasztás, 2. kör (Aggie):  node scripts/hang-proba2.mjs [--yes]
//  • a 9 próbaklip eleven_v4-gyel és eleven_flash_v2_5-tel;
//  • az 5 szó két javított változata eleven_v3-mal: „Alma.” (nagybetű + pont), és az „Ez egy alma.”
//    keretmondatból a betűnkénti időzítés alapján kivágva.
// Kimenet: .play/hangproba/kor2/ (nem kerül a repóba). FOGYASZT KREDITET: --yes nélkül csak becsül.
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { balance, client, ROOT } from './lib/elevenlabs.mjs';
import { concat, pcm16ToFloat, silence, trimAndNormalize, wav } from './lib/audio-dsp.mjs';

const RATE = 24000;
const VOICE = { name: 'Aggie', id: 'Dme3o25EiC1DfrBQd73f' };
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
const WORDS = LINES.slice(4);
const cap = (s) => s[0].toUpperCase() + s.slice(1);
const settings = { stability: 0.5, similarity_boost: 0.75 };

const jobs = [
  ...LINES.map(([id, text]) => ({ variant: 'v4', model: 'eleven_v4', id, text })),
  ...LINES.map(([id, text]) => ({ variant: 'flash', model: 'eleven_flash_v2_5', id, text })),
  ...WORDS.map(([id, w]) => ({ variant: 'v3pont', model: 'eleven_v3', id, text: `${cap(w)}.` })),
  ...WORDS.map(([id, w]) => ({ variant: 'v3keret', model: 'eleven_v3', id, text: `Ez egy ${w}.`, word: w })),
];

const api = client();
const chars = jobs.reduce((s, j) => s + j.text.length, 0);
const before = await balance(api);
console.log(`${jobs.length} klip, ${chars} karakter · egyenleg: ${before.remaining ?? '?'}`);
if (!process.argv.includes('--yes')) process.exit(0);

const outDir = path.join(ROOT, '.play', 'hangproba', 'kor2');
await mkdir(outDir, { recursive: true });
const byVariant = new Map();
const report = [];
let costSum = 0;
for (const j of jobs) {
  const body = { text: j.text, model_id: j.model, language_code: 'hu', voice_settings: settings };
  let pcm;
  let cost;
  if (j.word) {
    // Keretmondat: a szó első betűjének kezdetétől az utolsó betű végéig vágunk (kis ráhagyással).
    const r = await api.ttsWithTimestamps(VOICE.id, body, `pcm_${RATE}`);
    const all = pcm16ToFloat(r.bytes);
    const a = r.alignment;
    const startIdx = j.text.indexOf(j.word);
    const endIdx = startIdx + j.word.length - 1;
    const t0 = Math.max(0, a.character_start_times_seconds[startIdx] - 0.04);
    const t1 = a.character_end_times_seconds[endIdx] + 0.1;
    pcm = all.slice(Math.round(t0 * RATE), Math.round(t1 * RATE));
    cost = r.headers.get('character-cost');
  } else {
    const r = await api.tts(VOICE.id, body, `pcm_${RATE}`);
    pcm = pcm16ToFloat(r.bytes);
    cost = r.headers.get('character-cost');
  }
  const { samples, stats } = trimAndNormalize(pcm, RATE);
  await writeFile(path.join(outDir, `${VOICE.name}-${j.variant}-${j.id}.wav`), wav(samples, RATE));
  if (!byVariant.has(j.variant)) byVariant.set(j.variant, []);
  byVariant.get(j.variant).push(samples, silence(RATE, 0.9));
  costSum += Number(cost ?? 0);
  report.push({ ...j, cost, ...stats });
  process.stdout.write('.');
}
for (const [variant, parts] of byVariant) await writeFile(path.join(outDir, `${VOICE.name}-${variant}-proba.wav`), wav(concat(parts), RATE));
await writeFile(path.join(outDir, 'jelentes.json'), JSON.stringify({ before, costSum, report }, null, 2));
console.log(`\nKész: ${outDir}`);
console.log(`Költség a válaszfejlécek szerint: ${costSum} kredit`);
const per = {};
for (const r of report) {
  per[r.variant] ??= { chars: 0, cost: 0 };
  per[r.variant].chars += r.text.length;
  per[r.variant].cost += Number(r.cost ?? 0);
}
for (const [v, p] of Object.entries(per)) console.log(`  ${v}: ${p.chars} karakter → ${p.cost} kredit (${(p.cost / p.chars).toFixed(2)}/karakter)`);
for (const r of report.filter((x) => WORDS.some(([id]) => id === x.id))) console.log(`  ${r.variant} ${r.id}: ${r.durationS?.toFixed(2)} s`);
