// Az SVG-képkészlet legyártása a szókincsből:  npm run sprite
//
// Forrás: az `openmoji` csomag (OpenMoji, CC BY-SA 4.0), a szókincs minden szavának emoji-ja.
// Kimenet: src/assets/sprite/openmoji.svg, benne
//   • w-<id>  színes kép (az eredeti OpenMoji-rajz),
//   • s-<id>  árnyék (fekete sziluett, currentColor), csak a goodShadow szavakhoz.
// A kimenet az OpenMoji-rajzok módosított változata (azonosítók előtagolva, az árnyékok egyszínűek),
// ezért a CC BY-SA 4.0 licenc rá is érvényes (lásd LICENSES.md).
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const openmoji = path.join(root, 'node_modules', 'openmoji');
const outFile = path.join(root, 'src', 'assets', 'sprite', 'openmoji.svg');

const strip = (s) => s.replace(/[︎️]/g, '');

// emoji → hexcode (OpenMoji adatbázis)
const db = JSON.parse(await readFile(path.join(openmoji, 'data', 'openmoji.json'), 'utf8'));
const hexOf = new Map();
for (const e of db) {
  const key = strip(e.emoji);
  if (!hexOf.has(key)) hexOf.set(key, e.hexcode);
}

const { words } = JSON.parse(await readFile(path.join(root, 'content', 'szokincs.json'), 'utf8'));

// Fontos: a koordinátákat NEM kerekítjük. A tömörített útvonalírásban (pl. "1.0377.2552") a
// naiv kerekítés összeragasztja a szomszédos számokat, és szétesik a rajz (ezt egy korábbi
// változatnál a kontaktlapon láttuk: ló, cica, nyuszi, kígyó).
function prepare(svg, id) {
  const m = svg.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
  if (!m) throw new Error(`Hibás SVG: ${id}`);
  let inner = m[1];
  inner = inner.replace(/<!--[\s\S]*?-->/g, '');
  // azonosítók előtagolása (a sprite egy dokumentumban él, az azonosítók ne ütközzenek)
  inner = inner.replace(/\sid="([^"]*)"/g, (_, v) => ` id="${id}-${v}"`);
  inner = inner.replace(/url\(#([^)]+)\)/g, (_, v) => `url(#${id}-${v})`);
  inner = inner.replace(/(xlink:href|href)="#([^"]+)"/g, (_, a, v) => `${a}="#${id}-${v}"`);
  return inner.replace(/\n\s*/g, '').trim();
}

function shadowOf(inner) {
  return inner
    .replace(/\sfill="(?!none)[^"]*"/g, ' fill="currentColor"')
    .replace(/\sstroke="(?!none)[^"]*"/g, ' stroke="currentColor"')
    .replace(/\s(fill-opacity|stroke-opacity|opacity)="[^"]*"/g, '')
    .replace(/fill:\s*(?!none)[^;"]+/g, 'fill:currentColor')
    .replace(/stroke:\s*(?!none)[^;"]+/g, 'stroke:currentColor');
}

const missing = [];
const symbols = [];
let shadows = 0;
for (const w of words) {
  const hex = hexOf.get(strip(w.emoji));
  if (!hex) {
    missing.push(`${w.id} ${w.emoji}`);
    continue;
  }
  const file = path.join(openmoji, 'color', 'svg', `${hex}.svg`);
  let svg;
  try {
    svg = await readFile(file, 'utf8');
  } catch {
    missing.push(`${w.id} ${w.emoji} (${hex}.svg nincs)`);
    continue;
  }
  const inner = prepare(svg, w.id);
  symbols.push(`<symbol id="w-${w.id}" viewBox="0 0 72 72">${inner}</symbol>`);
  if (w.goodShadow) {
    symbols.push(`<symbol id="s-${w.id}" viewBox="0 0 72 72">${shadowOf(inner)}</symbol>`);
    shadows++;
  }
}

if (missing.length) {
  console.error('HIÁNYZÓ képek az OpenMoji-ban:\n  ' + missing.join('\n  '));
  process.exit(1);
}

const header =
  '<!-- Az OpenMoji (https://openmoji.org/) rajzainak módosított változata: azonosítók előtagolva, ' +
  'az s-* szimbólumok egyszínű árnyékok. Licenc: CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/). ' +
  'Generálta: scripts/build-sprite.mjs – kézzel ne szerkeszd. -->';

const out =
  `${header}\n` +
  '<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">' +
  symbols.join('\n') +
  '</svg>\n';

await mkdir(path.dirname(outFile), { recursive: true });
await writeFile(outFile, out, 'utf8');
console.log(
  `${words.length} szó, ${shadows} árnyék, ${symbols.length} szimbólum → ${path.relative(root, outFile)} (${(out.length / 1024).toFixed(0)} KB)`,
);
