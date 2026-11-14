// A hang-manifest szinkronizálása a szókincsel:  npm run manifest
// Minden szóhoz kell egy "szo-<id>" bejegyzés (a képre koppintva elhangzik a neve). A kézzel írt
// bejegyzések (pl. "utasitas-…") érintetlenek maradnak; a már nem létező szavak bejegyzései törlődnek.
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = path.join(root, 'content', 'audio', 'manifest.json');

const { words } = JSON.parse(await readFile(path.join(root, 'content', 'szokincs.json'), 'utf8'));
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));

const hand = Object.entries(manifest).filter(([k]) => !k.startsWith('szo-'));
const generated = words.map((w) => [`szo-${w.id}`, w.hu]);
const next = Object.fromEntries([...hand, ...generated]);

await writeFile(manifestPath, JSON.stringify(next, null, 2) + '\n', 'utf8');
console.log(`manifest: ${hand.length} kézi + ${generated.length} szó = ${Object.keys(next).length} bejegyzés`);
