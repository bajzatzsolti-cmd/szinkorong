// A szókincs és a párok jóváhagyási táblázata (Markdown):  npm run vocab:report
// Kimenet: docs/SZOKINCS-JOVAHAGYAS.md. A hangtani adatok a src/data/phonetics.ts-ből jönnek
// (a Node közvetlenül futtatja a .ts fájlt, ezért az importmentes).
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { derive } from '../src/data/phonetics.ts';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = async (p) => JSON.parse(await readFile(path.join(root, p), 'utf8'));

const { words } = await read('content/szokincs.json');
const cats = await read('content/kategoriak.json');
const { pairs, also } = await read('content/parok.json');
const props = (await read('content/kepjellemzok.json')).images;
const weights = (await read('content/suly.json')).classes;
const byId = new Map(words.map((w) => [w.id, w]));
const WEIGHT_NAMES = ['1 g alatt', '~10 g', '~100 g', '~1 kg', '~10 kg', '~100 kg', '~1 t', '~10 t'];

/** A kép mért jellemzői röviden: szín, irányos-e, féloldalas-e, súlyosztály. */
const imageInfo = (w) => {
  const p = props[w.id] ?? {};
  const parts = [w.color ?? p.color];
  if (w.directional ?? p.directional) parts.push('irányos');
  if (p.halfBalance !== undefined && p.halfBalance < 0.55) parts.push('féloldalas');
  if (weights[w.id] !== undefined) parts.push(`súly: ${WEIGHT_NAMES[weights[w.id]]}`);
  return parts.filter(Boolean).join(' · ');
};

const catIds = Object.keys(cats).filter((k) => !k.startsWith('_'));
const yes = (b) => (b ? 'igen' : '–');
const esc = (s) => String(s).replace(/\|/g, '\\|');

const rows = (list) =>
  list
    .map((w) => {
      const d = derive(w.hu);
      const phon = w.phon ?? d.phon;
      const syll = w.syllables ?? d.syllables;
      const flags = [...d.flags, ...(w.flags ?? [])];
      const remark = [w.note, ...flags].filter(Boolean).join('; ');
      const groups = [w.similar && `hasonló: ${w.similar}`, w.twin && `iker: ${w.twin}`].filter(Boolean).join(', ');
      return `| ${w.emoji} | **${esc(w.hu)}** | \`${w.id}\` | ${phon[0]} | ${phon[phon.length - 1]} | ${syll} | ${yes(w.goodShadow)} | ${w.clearName === false ? '**nem**' : 'igen'} | ${esc(groups)} | ${esc(imageInfo(w))} | ${esc(remark)} |`;
    })
    .join('\n');

const open = words.flatMap((w) => {
  const d = derive(w.hu);
  const flags = [...d.flags, ...(w.flags ?? [])];
  return flags.map((f) => `- ${w.emoji} **${w.hu}** (\`${w.id}\`): ${f}`);
});

const unclear = words.filter((w) => w.clearName === false);
const shadow = words.filter((w) => w.goodShadow);

let out = `# Szókincs és párok: jóváhagyásra

*Generálta: \`npm run vocab:report\` (scripts/vocab-report.mjs). Kézzel ne szerkeszd: a forrás a \`content/szokincs.json\`, \`content/kategoriak.json\` és \`content/parok.json\`.*

A szókincs a Színkorong központi szótára: minden képes feladat (árnyék, párok, csoportok, minták, később a hangtani feladatok is) ebből dolgozik.
**Kérlek, nézd át a besorolásokat, a jelzőket és a megjegyzéseket.** Ahol eltérést kérsz, elég megírnod a szót és a javítást.

## Összesítés

- ${words.length} szó, ${catIds.length} kategória, ${shadow.length} szó jó árnyékú, ${unclear.length} szónak nem egyértelmű a neve egy ötévesnek.
- ${pairs.length} pár és ${also.length} további összetartozás („also”) a „Mi tartozik össze?” témakörhöz.
- A képek az OpenMoji készletéből valók (CC BY-SA 4.0, lásd LICENSES.md).
- **Mért képjellemzők** (content/kepjellemzok.json, \`npm run image-props\`): a kép uralkodó színe, hogy van-e jól látható iránya (Kakukktojás: „másfelé néz”), és hogy féloldalas-e (az egyik felén alig van rajz: a Fél kép nem használja). Ezeket a gép méri a képekből; ha egy szín vagy irány nem stimmel, a szókincsben felülírható.
- **Súlyosztályok** (content/suly.json, tervezet): a Mérleg könnyű szintjéhez, ${Object.keys(weights).length} tárgyhoz.
- **Még üres, szándékosan:** a rímcsoport (a Hangoló plusz 4. sprintben, a rímpárokkal együtt).
- A kezdő- és végső hang, valamint a szótagszám a magyar névből automatikusan készül (kétjegyű betű = egy hang: cs, sz, zs, gy, ny, ty, ly, dz, dzs; a kettőzött hosszú mássalhangzó két hang). A bizonytalan esetek [ELLENŐRIZNI] jelzést kapnak.

## Amit külön kérek, hogy ellenőrizz (${open.length})

${open.length ? open.join('\n') : '*(nincs)*'}

## A nem egyértelmű nevű szavak (${unclear.length})

*A kép neve nem biztos, hogy egyértelmű egy ötévesnek. Az ilyen szavakat a Hangoló plusz (kezdőhang, végső hang, rím, szótagszám) NEM használja, a többi témakör igen.*

${unclear.map((w) => `- ${w.emoji} **${w.hu}**${w.note ? ': ' + w.note : ''}`).join('\n')}

## Kategóriák

| Azonosító | Név | Család | Csoportosítható (Csoportosító) | Szavak száma |
|---|---|---|---|---|
${catIds
  .map((id) => `| \`${id}\` | ${cats[id].name} | ${cats[id].family ?? id} | ${yes(cats[id].groupable)} | ${words.filter((w) => w.category === id).length} |`)
  .join('\n')}

*Család: ugyanabba a családba tartozó kategóriák nem szerepelhetnek egy lapon (a madár és a bogár is állat).*

## A szavak kategóriánként

Oszlopok: kép, név, azonosító, **kezdőhang**, **végső hang**, **szótagszám**, **jó árnyék** (felismerhető az árnyéka), **egyértelmű név**, csoportok (hasonló alakú árnyékok / iker-képek), **képjellemzők** (mért szín, irányos, féloldalas, súlyosztály), megjegyzés.

`;

for (const id of catIds) {
  const list = words.filter((w) => w.category === id);
  if (!list.length) continue;
  out += `### ${cats[id].name} (\`${id}\`, ${list.length} szó)\n\n| Kép | Név | Azonosító | Kezdő | Végső | Szótag | Árnyék | Egyért. név | Csoport | Képjellemzők | Megjegyzés |\n|---|---|---|---|---|---|---|---|---|---|---|\n${rows(list)}\n\n`;
}

const pairLine = ([a, b]) => `| ${byId.get(a)?.emoji ?? '?'} ${byId.get(a)?.hu ?? a} | ${byId.get(b)?.emoji ?? '?'} ${byId.get(b)?.hu ?? b} |`;
out += `## „Mi tartozik össze?” párok (tervezet, ${pairs.length} db)

*A lapon a két kép közül véletlenül az egyik a feladat, a másik a megoldás. A változatossághoz kb. 80 pár kellene: kérlek, javasolj további párokat, vagy jelezd, melyik nem jó.*

| Egyik | Másik |
|---|---|
${pairs.map(pairLine).join('\n')}

### További összetartozások (nem pár, de ütközést okoznak; ${also.length} db)

*Ha egy lapon mindkét szó szerepelne, az egyik feladathoz két megoldás is illene: ezért nem kerülhetnek egy lapra.*

| Egyik | Másik |
|---|---|
${also.map(pairLine).join('\n')}
`;

await writeFile(path.join(root, 'docs', 'SZOKINCS-JOVAHAGYAS.md'), out, 'utf8');
console.log(`docs/SZOKINCS-JOVAHAGYAS.md: ${words.length} szó, ${pairs.length} pár, ${open.length} ellenőrzendő megjegyzés`);
