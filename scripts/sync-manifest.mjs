// A hang-manifest szinkronizálása:  npm run manifest
//  • szo-<id>: minden szóhoz (a képre koppintva elhangzik a neve), a szókincsből;
//  • holvan-<mondat> és haakkor-<feladat>: a hallás utáni témakörök mondatai a content/holvan.json és
//    content/haakkor.json fájlból, de CSAK azok, amelyek tényleg szerepelnek valamelyik lapon (a hangfájlok
//    kreditbe kerülnek: a fel nem használt mondatot nem gyártjuk le). Ehhez a script lefuttatja az összes
//    témakör generátorát (a Vite modulbetöltőjével, mert a forrás TypeScript).
//  • a kézzel írt bejegyzések (utasitas-…, hangolo-…) érintetlenek maradnak; ami már nem kell, törlődik.
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = path.join(root, 'content', 'audio', 'manifest.json');
const read = async (p) => JSON.parse(await readFile(path.join(root, p), 'utf8'));

const { words } = await read('content/szokincs.json');
const holvan = await read('content/holvan.json');
const haakkor = await read('content/haakkor.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));

// A lapokon ténylegesen használt hanganyagok (minden témakör mind a 15 lapja + a bemutatók).
const server = await createServer({ root, logLevel: 'error', server: { middlewareMode: true, hmr: false }, appType: 'custom' });
let used;
try {
  const { TOPICS, buildSheet, buildDemo } = await server.ssrLoadModule('/src/topics/index.ts');
  const { sayIds } = await server.ssrLoadModule('/src/engine/say-ids.ts');
  used = new Set();
  for (const topic of TOPICS) {
    const sheets = Array.from({ length: 15 }, (_, i) => buildSheet(topic, i));
    if (topic.demoSize) sheets.push(buildDemo(topic));
    // A feladatok, megoldások és a képeken belüli hangos elemek (pl. a Betűkereső betűi) azonosítói.
    for (const s of sheets) sayIds([s.tasks, s.answers], used);
  }
} finally {
  await server.close();
}

const GENERATED_PREFIXES = ['szo-', 'holvan-', 'haakkor-'];
const hand = Object.entries(manifest).filter(([k]) => !GENERATED_PREFIXES.some((p) => k.startsWith(p)));
const wordEntries = words.map((w) => [`szo-${w.id}`, w.hu]);
const holvanEntries = Object.entries(holvan.mondatok)
  .map(([id, text]) => [`holvan-${id}`, text])
  .filter(([k]) => used.has(k));
const haakkorEntries = haakkor.feladatok.map((f) => [`haakkor-${f.id}`, f.szoveg]).filter(([k]) => used.has(k));

const next = Object.fromEntries([...hand, ...wordEntries, ...holvanEntries, ...haakkorEntries]);
const missing = [...used].filter((k) => !(k in next));
await writeFile(manifestPath, JSON.stringify(next, null, 2) + '\n', 'utf8');
console.log(
  `manifest: ${hand.length} kézi + ${wordEntries.length} szó + ${holvanEntries.length} Hol van?-mondat ` +
    `(${Object.keys(holvan.mondatok).length}-ból) + ${haakkorEntries.length} Ha–akkor feladat = ${Object.keys(next).length} bejegyzés`,
);
if (missing.length) {
  console.log(`HIÁNYZIK a manifestből (kézi bejegyzés kell): ${missing.join(', ')}`);
  process.exit(1);
}
