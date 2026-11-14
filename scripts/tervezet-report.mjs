// A 4b tervezetek (Hol van?, Ha–akkor, rímpárok) olvasható jóváhagyási táblázata:  npm run tervezet:report
// Kimenet: docs/TERVEZET-4B.md. A forrás a content/holvan.json, content/haakkor.json és content/rimek.json.
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = async (p) => JSON.parse(await readFile(path.join(root, p), 'utf8'));
const holvan = await read('content/holvan.json');
const haakkor = await read('content/haakkor.json');
const rimek = await read('content/rimek.json');
const { words } = await read('content/szokincs.json');
const hu = new Map(words.map((w) => [w.id, `${w.emoji} ${w.hu}`]));
const name = (id) => hu.get(id) ?? `**${id}** [nincs a szókincsben]`;
const esc = (s) => String(s).replace(/\|/g, '\\|');

let out = `# 4b tervezetek: jóváhagyásra

*Generálta: \`npm run tervezet:report\`. Kézzel ne szerkeszd: a forrás a \`content/holvan.json\`, \`content/haakkor.json\` és \`content/rimek.json\` (ezek kód nélkül szerkeszthetők).*

**Kérlek, nézd át a mondatokat, a szintbeosztást és a jelölt bizonytalanságokat.** Ahol eltérést kérsz, elég megírnod az azonosítót és a javítást. A hangfájlok csak a jóváhagyás után készülnek el (kreditet csak egyszer költünk rájuk).

## Hol van? (relációszókincs, hallás után)

${holvan._elvek.map((e) => `- ${e}`).join('\n')}

**Szintbeosztás (javaslat):**

${Object.entries(holvan._szintek_javaslat).map(([k, v]) => `- **${k}:** ${v}`).join('\n')}

**Viszonyok és rajzuk:**

| Viszony | Szint | Hogyan rajzolom |
|---|---|---|
${Object.values(holvan.viszonyok).map((r) => `| ${r.nev} | ${r.szint}. | ${esc(r.rajz)} |`).join('\n')}

**Szereplők:** ${holvan.szereplok.map(name).join(', ')}.
**Tárgyak:** ${Object.values(holvan.helyek).map((h) => `${h.nev} (${h.kep.startsWith('[') ? h.kep : name(h.kep)})`).join(', ')}.

**Mondatok (${Object.keys(holvan.mondatok).length} db), a cicával; a többi szereplővel ugyanígy:**

| Azonosító | Mondat |
|---|---|
${Object.entries(holvan.mondatok)
  .filter(([id]) => id.startsWith('cica-'))
  .map(([id, s]) => `| \`${id}\` | ${esc(s)} |`)
  .join('\n')}

## Ha–akkor (tapasztalati következtetés, hallás után)

${haakkor._elvek.map((e) => `- ${e}`).join('\n')}

${[1, 2, 3]
  .map(
    (lvl) => `### ${lvl}. szint (${haakkor.feladatok.filter((f) => f.szint === lvl).length} feladat)

| Azonosító | Amit a gyerek hall | Megoldás | Nem lehet vele egy lapon |
|---|---|---|---|
${haakkor.feladatok
  .filter((f) => f.szint === lvl)
  .map((f) => `| \`${f.id}\` | ${esc(f.szoveg)} | ${name(f.valasz)} | ${f.utkozik.map(name).join(', ') || '–'} |`)
  .join('\n')}`,
  )
  .join('\n\n')}

## Rímpárok (Hangoló plusz)

${rimek._elv}

| Egyik | Másik |
|---|---|
${rimek.parok.map(([a, b]) => `| ${name(a)} | ${name(b)} |`).join('\n')}

**Bizonytalanok (most nem használjuk):**

${rimek.bizonytalan.map((b) => `- ${b.par.map(name).join(' – ')}: ${b.megjegyzes}`).join('\n')}

*11 pár kevés a változatossághoz: ha eszedbe jut még rímelő képpár (akár új képpel), írd meg.*
`;

await writeFile(path.join(root, 'docs', 'TERVEZET-4B.md'), out, 'utf8');
console.log(`docs/TERVEZET-4B.md: ${Object.keys(holvan.mondatok).length} Hol van?-mondat, ${haakkor.feladatok.length} Ha–akkor feladat, ${rimek.parok.length} rímpár`);
