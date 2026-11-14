// Ellenőrzi, hogy a csomagolt betűtípusok tartalmazzák-e a magyar ékezetes betűket (különösen ő, ű):
//  • latin részhalmaz:     á é í ó ö ú ü (és nagybetűs párjaik)
//  • latin-ext részhalmaz: ő ű (és nagybetűs párjaik)
//  • Fredoka: számjegyek és kérdőjel
// Futtatás:  npm run check:fonts   (a src/styles/fonts.css unicode-range-eivel együtt értelmes)
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as fontkit from 'fontkit';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'node_modules', '@fontsource');
const LATIN_HU = 'áÁéÉíÍóÓöÖúÚüÜ';
const EXT_HU = 'őŐűŰ';
const NUM = '0123456789?';

const checks = [
  ['nunito/files/nunito-latin-400-normal.woff2', LATIN_HU],
  ['nunito/files/nunito-latin-700-normal.woff2', LATIN_HU],
  ['nunito/files/nunito-latin-ext-400-normal.woff2', EXT_HU],
  ['nunito/files/nunito-latin-ext-700-normal.woff2', EXT_HU],
  ['fredoka/files/fredoka-latin-600-normal.woff2', NUM],
];

let bad = 0;
for (const [file, chars] of checks) {
  const font = fontkit.openSync(path.join(root, file));
  const missing = [...chars].filter((c) => !font.hasGlyphForCodePoint(c.codePointAt(0)));
  const status = missing.length ? `HIÁNYZIK: ${missing.join(' ')}` : `rendben (${[...chars].join('')})`;
  console.log(`${file.padEnd(50)} ${status}`);
  if (missing.length) bad++;
}
process.exit(bad ? 1 : 0);
