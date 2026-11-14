// A Kakukktojás verifikátora. Minden négyes csoportban megkeresi a kilógó elemet:
//  • ha a négy kép mind különböző, a kategória-család dönt (három egy családba tartozik, egy nem),
//    és az uralkodó szín nem adhat másik kakukktojást;
//  • ha vannak egyformák, három egyforma és egy eltérő elem kell, és az eltérés egyetlen tulajdonság
//    (irány, darabszám vagy szín).
import { CATEGORIES, WORD_BY_ID, isPictureSafe } from '../../data/vocab';
import type { Sheet } from '../../engine/sheet';
import { verifyCommon } from '../../engine/verify';
import { visualKey, type Visual } from '../../render/visual';
import { DIRECTION_CATEGORIES, DIRECTION_MIN_ASYM, EASY_CATEGORIES, SIZES, colourOdd } from './generate';

type Attr = 'flip' | 'count' | 'tint';

/** Két változat közti különbség (ha pontosan egy tulajdonságban térnek el), különben null. */
function attributeDiff(a: Visual, b: Visual): Attr | null {
  const single = (v: Visual): Visual => (v.t === 'pack' && v.items.length === 2 && visualKey(v.items[0]!) === visualKey(v.items[1]!) ? v.items[0]! : v);
  const countOf = (v: Visual): number => (v.t === 'pack' ? v.items.length : 1);
  const sa = single(a);
  const sb = single(b);
  if (countOf(a) !== countOf(b)) return visualKey(sa) === visualKey(sb) ? 'count' : null;
  if (sa.t === 'img' && sb.t === 'img' && sa.id === sb.id && !!sa.flip !== !!sb.flip && !sa.shadow && !sb.shadow) return 'flip';
  if (sa.t === 'shape' && sb.t === 'shape' && sa.id === sb.id && sa.fill === sb.fill && sa.tint && sb.tint && sa.tint !== sb.tint) return 'tint';
  return null;
}

export function verify(sheet: Sheet): string[] {
  const problems = verifyCommon(sheet, SIZES);
  const level = sheet.spec.level;
  const answerKeys = sheet.answers.map((a) => visualKey(a.visual));
  const claimed = new Map<number, number>();

  sheet.tasks.forEach((task, ti) => {
    const label = `${ti + 1}. feladat`;
    const v = task.visual;
    if (v.t !== 'seq' || v.items.length !== 4) return void problems.push(`${label}: nem négy elemből áll.`);
    const keys = v.items.map(visualKey);
    let oddIndex: number;

    if (new Set(keys).size === 4) {
      // Kategória szerint.
      if (level === 2) problems.push(`${label}: a 3. szinten tulajdonság szerinti feladat kell.`);
      const words = v.items.map((item) => (item.t === 'img' && !item.flip && !item.shadow ? WORD_BY_ID.get(item.id) : undefined));
      if (words.some((w) => !w)) return void problems.push(`${label}: nem csupa (sima) szókincs-kép.`);
      for (const w of words) {
        if (!isPictureSafe(w!)) problems.push(`${label}: ${w!.id} adata ellenőrzésre vár.`);
        const cat = CATEGORIES[w!.category];
        if (!cat?.groupable) problems.push(`${label}: ${w!.id} kategóriája nem csoportosítható.`);
        if (level === 0 && !EASY_CATEGORIES.includes(w!.category)) problems.push(`${label}: az 1. szinten csak a könnyű csoportok szerepelhetnek.`);
      }
      const fams = words.map((w) => CATEGORIES[w!.category]!.family);
      const odd = fams.flatMap((f, i) => (fams.filter((g) => g === f).length === 1 ? [i] : []));
      const rest = fams.filter((_, i) => i !== odd[0]);
      if (odd.length !== 1 || !rest.every((f) => f === rest[0])) return void problems.push(`${label}: nem három egy csoportból és egy kilógó.`);
      oddIndex = odd[0]!;
      const co = colourOdd(words.map((w) => w!.color));
      if (co !== null && co !== oddIndex) problems.push(`${label}: a színe szerint egy másik kép lógna ki (${words[co]!.id}).`);
    } else {
      // Tulajdonság szerint.
      if (level !== 2) problems.push(`${label}: az 1–2. szinten kategória szerinti feladat kell.`);
      const counts = new Map<string, number>();
      for (const k of keys) counts.set(k, (counts.get(k) ?? 0) + 1);
      const sorted = [...counts.values()].sort();
      if (sorted.length !== 2 || sorted[0] !== 1 || sorted[1] !== 3) return void problems.push(`${label}: nem három egyforma és egy eltérő elem.`);
      oddIndex = keys.findIndex((k) => counts.get(k) === 1);
      const base = v.items[keys.findIndex((k) => counts.get(k) === 3)]!;
      const odd = v.items[oddIndex]!;
      const diff = attributeDiff(base, odd);
      if (!diff) return void problems.push(`${label}: a kilógó elem nem egyetlen tulajdonságban (irány, darabszám, szín) tér el.`);
      if (diff === 'flip') {
        const w = WORD_BY_ID.get((base as Extract<Visual, { t: 'img' }>).id);
        if (!w || !w.directional || w.asym < DIRECTION_MIN_ASYM || !DIRECTION_CATEGORIES.includes(w.category)) problems.push(`${label}: a kép iránya nem látszik elég jól.`);
      }
    }

    const oddKey = keys[oddIndex]!;
    const fits = answerKeys.flatMap((k, ai) => (k === oddKey ? [ai] : []));
    if (fits.length !== 1) return void problems.push(`${label}: ${fits.length} megoldás illik (pontosan 1 kellene).`);
    const ai = fits[0]!;
    claimed.set(ai, (claimed.get(ai) ?? 0) + 1);
    if (sheet.answers[ai]!.disc !== task.disc) problems.push(`${label}: az illő megoldás más koronghoz van rendelve.`);

    // Kerülőút-ellenőrzés: a csoportban legalább két megoldás-kép legyen (a sajátja és egy másiké),
    // különben elég volna megkeresni, melyik megoldás-kép szerepel benne.
    const present = new Set(keys.filter((k) => answerKeys.includes(k)));
    if (present.size < 2) problems.push(`${label}: kerülőúton is megoldható (csak egy megoldás-kép van a csoportban).`);
  });

  sheet.answers.forEach((_, ai) => {
    if ((claimed.get(ai) ?? 0) !== 1) problems.push(`${ai + 1}. megoldás: nem pontosan egy feladathoz tartozik.`);
  });
  return problems;
}
