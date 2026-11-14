// Képjellemzők automatikus mérése a szókincs képeiből:  npm run image-props
//
// Minden szó színes képét (a sprite-ból) kis PNG-vé rajzolja (sharp), és megméri:
//  • color: a kép uralkodó színe (piros, narancs, sárga, zöld, kék, lila, rózsaszín, barna, szürke, fehér, fekete)
//    – a kontúr (fekete vonalak) és az átlátszó háttér nem számít;
//  • asym: mennyire tér el a kép a saját tükörképétől (0 = szimmetrikus, 1 = teljesen más);
//    0.18 fölött a képnek jól látható iránya van (balra vagy jobbra néz) → directional.
// Kimenet: content/kepjellemzok.json. A szókincsben (szokincs.json) a "color" és a "directional" mező felülírja.
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const sprite = await readFile(path.join(root, 'src', 'assets', 'sprite', 'openmoji.svg'), 'utf8');
const { words } = JSON.parse(await readFile(path.join(root, 'content', 'szokincs.json'), 'utf8'));

const SIZE = 64;
const ASYM_LIMIT = 0.18;

function symbolSvg(id) {
  const m = sprite.match(new RegExp(`<symbol id="w-${id}" viewBox="0 0 72 72">([\\s\\S]*?)</symbol>`));
  if (!m) throw new Error(`nincs kép: ${id}`);
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72" width="${SIZE}" height="${SIZE}">${m[1]}</svg>`);
}

function hsl(r, g, b) {
  const [R, G, B] = [r / 255, g / 255, b / 255];
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h;
  if (max === R) h = 60 * (((G - B) / d) % 6);
  else if (max === G) h = 60 * ((B - R) / d + 2);
  else h = 60 * ((R - G) / d + 4);
  return { h: (h + 360) % 360, s, l };
}

function bucket(r, g, b) {
  const { h, s, l } = hsl(r, g, b);
  if (l < 0.16) return 'fekete';
  if (s < 0.18) return l > 0.85 ? 'fehér' : 'szürke';
  if (l > 0.93) return 'fehér';
  // Barna: narancsos árnyalat, de tompább (kisebb telítettség) vagy sötétebb, mint a narancs.
  if (h >= 10 && h < 48 && (s < 0.6 || l < 0.45)) return 'barna';
  if (h < 12 || h >= 345) return l > 0.75 ? 'rózsaszín' : 'piros';
  if (h < 42) return 'narancs';
  if (h < 68) return 'sárga';
  if (h < 165) return 'zöld';
  if (h < 255) return 'kék';
  if (h < 300) return 'lila';
  return 'rózsaszín';
}

const out = {};
for (const w of words) {
  const { data } = await sharp(symbolSvg(w.id)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const counts = {};
  let ink = 0;
  let diff = 0;
  let total = 0;
  let inkLeft = 0;
  let inkRight = 0;
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const i = (y * SIZE + x) * 4;
      const j = (y * SIZE + (SIZE - 1 - x)) * 4;
      const a = data[i + 3] > 127;
      const am = data[j + 3] > 127;
      if (a || am) {
        total++;
        if (a !== am) diff++;
      }
      if (!a) continue;
      ink++;
      if (x < SIZE / 2) inkLeft++;
      else inkRight++;
      const name = bucket(data[i], data[i + 1], data[i + 2]);
      if (name === 'fekete') continue; // kontúr
      counts[name] = (counts[name] ?? 0) + 1;
    }
  }
  const sorted = Object.entries(counts).sort((p, q) => q[1] - p[1]);
  const asym = total ? diff / total : 0;
  out[w.id] = {
    color: sorted[0]?.[0] ?? 'fekete',
    share: sorted[0] ? Number((sorted[0][1] / Math.max(1, ink)).toFixed(2)) : 0,
    asym: Number(asym.toFixed(3)),
    directional: asym > ASYM_LIMIT,
    // A két fél kiegyensúlyozottsága (a kevesebb rajzot tartalmazó fél / a több): 1 = egyforma sok rajz.
    halfBalance: Number((Math.min(inkLeft, inkRight) / Math.max(1, inkLeft, inkRight)).toFixed(2)),
  };
}

const file = {
  _info:
    'GENERÁLT FÁJL (scripts/image-props.mjs, npm run image-props) – ne szerkeszd kézzel. A kép uralkodó színe (color, és hogy a festett rész mekkora hányada: share), hogy van-e jól látható iránya (directional, asym = eltérés a tükörképtől), és hogy a bal és a jobb fele mennyire egyformán rajzolt (halfBalance, 1 = egyformán). Felülírni a szokincs.json "color" / "directional" mezőjével lehet.',
  images: out,
};
await writeFile(path.join(root, 'content', 'kepjellemzok.json'), JSON.stringify(file, null, 1) + '\n', 'utf8');
const dir = Object.values(out).filter((p) => p.directional).length;
const colors = {};
for (const p of Object.values(out)) colors[p.color] = (colors[p.color] ?? 0) + 1;
console.log(`content/kepjellemzok.json: ${Object.keys(out).length} kép, ${dir} irányos; színek: ${JSON.stringify(colors)}`);
