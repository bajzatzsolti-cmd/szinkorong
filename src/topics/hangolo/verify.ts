// Hangoló plusz verifikátora: a feladat jeléből olvassa ki a szabályt, és a szókincs hangtani adatai alapján,
// a generátortól függetlenül megoldja a lapot.
//  • Egyértelműség: a feladat szabálya szerint a lap ÖSSZES megoldása közül pontosan egy illik (és az azonos
//    hangú, nem csak összetéveszthető); a zöngés–zöngétlen pár is „illőnek” számít, hogy ne legyen bizonytalanság.
//    (A vegyes lapon a feladat jele és hangja mondja meg a szabályt; a más szabály szerinti egyezés nem
//    kétértelműség, hanem a jel figyelmen kívül hagyása: azt az ellenőrzés jelzi.)
//  • Kerülőút: a feladat és a megoldás képe nem tartozhat össze másképp (csoport, pár).
import { WORD_BY_ID, type Word } from '../../data/vocab';
import type { Sheet } from '../../engine/sheet';
import { verifyCommon } from '../../engine/verify';
import type { Visual } from '../../render/visual';
import { MAX_SYLLABLES, RULE_SYM, SIZES, confusable, fitsRule, shortcut, soundOf, type Rule } from './rules';

const RULE_OF_SYM = new Map<string, Rule>(Object.entries(RULE_SYM).map(([rule, sym]) => [sym, rule as Rule]));

type Answer = { kind: 'word'; w: Word } | { kind: 'count'; k: number } | null;

export function verify(sheet: Sheet): string[] {
  const problems = verifyCommon(sheet, SIZES);

  const parseTask = (v: Visual, label: string): { w: Word; rule: Rule } | null => {
    if (v.t !== 'seq' || v.items.length !== 2) {
      problems.push(`${label}: nem „kép + jel” alakú.`);
      return null;
    }
    const [pic, sym] = v.items as [Visual, Visual];
    const rule = sym.t === 'sym' ? RULE_OF_SYM.get(sym.id) : undefined;
    const w = pic.t === 'img' ? WORD_BY_ID.get(pic.id) : undefined;
    if (!w || !rule) {
      problems.push(`${label}: ismeretlen kép vagy jel.`);
      return null;
    }
    if (!fitsRule(w, rule)) problems.push(`${label}: a(z) ${w.id} nem használható ehhez a szabályhoz (${rule}).`);
    return { w, rule };
  };
  const parseAnswer = (v: Visual, label: string): Answer => {
    if (v.t === 'dots') {
      if (v.k < 1 || v.k > MAX_SYLLABLES) problems.push(`${label}: ${v.k} taps nem lehet.`);
      return { kind: 'count', k: v.k };
    }
    const w = v.t === 'img' ? WORD_BY_ID.get(v.id) : undefined;
    if (!w) {
      problems.push(`${label}: ismeretlen megoldás.`);
      return null;
    }
    return { kind: 'word', w };
  };

  const tasks = sheet.tasks.map((t, i) => parseTask(t.visual, `${i + 1}. feladat`));
  const answers = sheet.answers.map((a, i) => parseAnswer(a.visual, `${i + 1}. megoldás`));

  const ids = [
    ...tasks.map((t) => t?.w.id),
    ...answers.map((a) => (a?.kind === 'word' ? a.w.id : null)).filter(Boolean),
  ];
  if (new Set(ids).size !== ids.length) problems.push('Egy kép kétszer szerepel a lapon.');

  if (sheet.spec.level === 0 && tasks.some((t) => t?.rule !== 'kezdo')) problems.push('Az 1. szinten csak kezdőhang-feladat lehet.');
  if (sheet.spec.level === 1 && tasks.some((t) => t?.rule !== 'veg')) problems.push('A 2. szinten csak végsőhang-feladat lehet.');

  const claimed = new Map<number, number>();
  tasks.forEach((t, ti) => {
    if (!t) return;
    const label = `${ti + 1}. feladat (${t.w.hu})`;
    let fits: number[];
    if (t.rule === 'szotag') {
      fits = answers.flatMap((a, ai) => (a?.kind === 'count' && a.k === t.w.syllables ? [ai] : []));
    } else {
      const rule = t.rule;
      fits = answers.flatMap((a, ai) => (a?.kind === 'word' && confusable(soundOf(t.w, rule), soundOf(a.w, rule)) ? [ai] : []));
    }
    if (fits.length !== 1) {
      problems.push(`${label}: ${fits.length} megoldás illik (pontosan 1 kellene).`);
      return;
    }
    const ai = fits[0]!;
    const a = answers[ai]!;
    if (t.rule !== 'szotag' && a.kind === 'word') {
      if (soundOf(t.w, t.rule) !== soundOf(a.w, t.rule)) problems.push(`${label}: a megoldás csak hasonló hangú, nem azonos.`);
      if (shortcut(t.w, a.w)) problems.push(`${label}: a megoldás hang nélkül is kitalálható (csoport vagy pár).`);
    }
    claimed.set(ai, (claimed.get(ai) ?? 0) + 1);
    if (sheet.answers[ai]!.disc !== sheet.tasks[ti]!.disc) problems.push(`${label}: az illő megoldás más koronghoz van rendelve.`);
  });
  sheet.answers.forEach((_, ai) => {
    if ((claimed.get(ai) ?? 0) !== 1) problems.push(`${ai + 1}. megoldás: nem pontosan egy feladathoz tartozik.`);
  });
  return problems;
}
