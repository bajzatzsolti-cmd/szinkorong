// A Sorminta verifikátora. A generátortól FÜGGETLENÜL, szabály alapján megoldja a lapot:
// a feladat sorából kikeresi a legrövidebb ismétlődő egységet, és megmondja a hiányzó elemet.
import { verifyCommon } from '../../engine/verify';
import type { Sheet } from '../../engine/sheet';
import { visualKey } from '../../render/visual';
import { SIZES, MAX_ELEMENTS } from './generate';

const MAX_PERIOD = 4;

export type Solved = { ok: true; symbol: string } | { ok: false; why: string };

const fail = (why: string): Solved => ({ ok: false, why });

/**
 * @param keys A sor elemeinek kanonikus kulcsai; a hiányzó hely kulcsa: 'blank'.
 * A szabály: a legrövidebb (2–4 hosszú) ismétlődő egység, amely a látható elemekkel nem ütközik.
 * Elfogadjuk a feladatot, ha az egység legalább kétszer teljesen látszik, és minden más
 * (4-nél nem hosszabb) egység, amely értelmezhető, ugyanazt a hiányzó elemet adja.
 */
export function solveSequence(keys: readonly string[]): Solved {
  const gaps = keys.flatMap((k, i) => (k === 'blank' ? [i] : []));
  if (gaps.length !== 1) return fail('Pontosan egy üres helynek kell lennie a sorban.');
  const gap = gaps[0] as number;

  const consistent: { p: number; symbol: string | null }[] = [];
  for (let p = 1; p <= MAX_PERIOD; p++) {
    const classes = new Map<number, string>();
    let ok = true;
    keys.forEach((k, i) => {
      if (i === gap) return;
      const c = i % p;
      const prev = classes.get(c);
      if (prev === undefined) classes.set(c, k);
      else if (prev !== k) ok = false;
    });
    if (ok) consistent.push({ p, symbol: classes.get(gap % p) ?? null });
  }

  const base = consistent[0];
  if (!base) return fail(`Nincs ${MAX_PERIOD}-nél nem hosszabb ismétlődő egység.`);
  if (base.p < 2) return fail('A látható elemek mind egyformák.');
  if (base.symbol === null) return fail('A hiányzó elem helye nem szerepel a látható mintában.');
  if (keys.length - 1 < 2 * base.p) return fail('Az egység nem látszik kétszer teljesen.');
  for (const c of consistent) {
    if (c.symbol !== null && c.symbol !== base.symbol) {
      return fail('Két különböző szabály különböző hiányzó elemet ad.');
    }
  }
  return { ok: true, symbol: base.symbol };
}

export function verify(sheet: Sheet): string[] {
  const problems = verifyCommon(sheet, SIZES);

  const answerKeys = sheet.answers.map((a) => visualKey(a.visual));
  const claimed = new Map<number, number>(); // megoldás sorszáma → hány feladat tartja a sajátjának

  sheet.tasks.forEach((task, ti) => {
    const label = `${ti + 1}. feladat`;
    if (task.visual.t !== 'seq') {
      problems.push(`${label}: nem sor.`);
      return;
    }
    const keys = task.visual.items.map(visualKey);
    if (keys.length > MAX_ELEMENTS) problems.push(`${label}: túl hosszú sor (${keys.length}).`);

    const solved = solveSequence(keys);
    if (!solved.ok) {
      problems.push(`${label}: ${solved.why}`);
      return;
    }

    // Pontosan egy megoldás illeszkedik, és az a feladat korongjához tartozik.
    const fits = answerKeys.flatMap((k, ai) => (k === solved.symbol ? [ai] : []));
    if (fits.length !== 1) {
      problems.push(`${label}: ${fits.length} megoldás illeszkedik (pontosan 1 kellene).`);
      return;
    }
    const ai = fits[0] as number;
    claimed.set(ai, (claimed.get(ai) ?? 0) + 1);
    if (sheet.answers[ai]!.disc !== task.disc) {
      problems.push(`${label}: az illeszkedő megoldás más koronghoz van rendelve.`);
    }

    // Kerülőút-ellenőrzés: legalább két megoldás-kép szerepeljen a sorban, különben
    // „melyik kép van a sorban?” kérdéssel is megtalálható a válasz, a minta ismerete nélkül.
    const visibleAnswers = new Set(keys.filter((k) => answerKeys.includes(k)));
    if (visibleAnswers.size < 2) problems.push(`${label}: kerülőúton is megoldható (a sorban csak egy megoldás-kép van).`);
  });

  sheet.answers.forEach((_, ai) => {
    if ((claimed.get(ai) ?? 0) !== 1) problems.push(`${ai + 1}. megoldás: nem pontosan egy feladathoz tartozik.`);
  });

  return problems;
}
