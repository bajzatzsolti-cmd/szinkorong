// Az ikonok legyártása a public/icons/icon.svg-ből (sharp). A kész PNG-ket a repó tartalmazza,
// ezt csak akkor kell újra futtatni, ha az ikon rajza változik:  npm run icons
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons');
const svg = await readFile(path.join(dir, 'icon.svg'), 'utf8');

// Maszkolható (maskable) változat: a rajz a biztonsági zónába (kb. 76%) kerül.
const maskable = svg.replace(
  '<g id="art">',
  '<g id="art" transform="translate(256 256) scale(.76) translate(-256 -256)">',
);

const jobs = [
  ['apple-touch-icon.png', svg, 180],
  ['icon-192.png', svg, 192],
  ['icon-512.png', svg, 512],
  ['icon-maskable-512.png', maskable, 512],
];

for (const [name, source, size] of jobs) {
  const png = await sharp(Buffer.from(source), { density: 384 }).resize(size, size).png({ compressionLevel: 9 }).toBuffer();
  await writeFile(path.join(dir, name), png);
  console.log(`${name}  ${size}×${size}  ${(png.length / 1024).toFixed(1)} KB`);
}
