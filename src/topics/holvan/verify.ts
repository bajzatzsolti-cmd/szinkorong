// Hol van? verifikátora: a feladat hangazonosítójából kiolvassa a mondatot (szereplő-tárgy-viszony), és a
// generátortól függetlenül megkeresi a hozzá illő jelenetet.
//  • minden mondathoz pontosan egy jelenet illik (ugyanaz a szereplő, tárgy és viszony);
//  • a lapon egy szereplő; a viszony az adott tárgynál rajzolható (content/holvan.json);
//  • az 1. szinten egy tárgy, jobbra/balra csak a 3. szinten;
//  • a jobbra/balra mellett ugyanazzal a tárggyal nincs „mellett” vagy „mögött” (oldalt álló, összetéveszthető kép).
import type { Sheet } from '../../engine/sheet';
import { verifyCommon } from '../../engine/verify';
import { BASIC_RELS, SENTENCES, SIDE_RELS, parseSentenceId, relsOf } from './data';
import { SIZES } from './generate';

export function verify(sheet: Sheet): string[] {
  const problems = verifyCommon(sheet, SIZES);
  const level = sheet.spec.level;

  const tasks = sheet.tasks.map((t, i) => {
    const id = t.say?.startsWith('holvan-') ? t.say.slice('holvan-'.length) : '';
    const parsed = parseSentenceId(id);
    if (!parsed || !SENTENCES[id]) {
      problems.push(`${i + 1}. feladat: nincs ilyen mondat (${t.say ?? '–'}).`);
      return null;
    }
    if (t.visual.t !== 'sym' || t.visual.id !== 'listen') problems.push(`${i + 1}. feladat: a képe nem hangszóró.`);
    return parsed;
  });
  const scenes = sheet.answers.map((a, i) => {
    if (a.visual.t !== 'scene') {
      problems.push(`${i + 1}. megoldás: nem jelenet.`);
      return null;
    }
    const v = a.visual;
    if (!relsOf(v.place).includes(v.rel)) problems.push(`${i + 1}. megoldás: a(z) ${v.rel} a(z) ${v.place} tárgynál nem rajzolható.`);
    return v;
  });

  const figs = new Set(scenes.filter(Boolean).map((s) => s!.fig));
  if (figs.size > 1) problems.push('A lapon több szereplő is van (egy kellene).');
  const places = new Set(scenes.filter(Boolean).map((s) => s!.place));
  if (level === 0 && places.size !== 1) problems.push('Az 1. szinten egy tárgy kell.');
  if (places.size > 2) problems.push('Legfeljebb két tárgy lehet a lapon.');
  for (const s of scenes) {
    if (!s) continue;
    if (level < 2 && !BASIC_RELS.includes(s.rel)) problems.push(`Jobbra/balra csak a 3. szinten lehet (${s.rel}).`);
  }
  for (const place of places) {
    const rels = scenes.filter((s) => s?.place === place).map((s) => s!.rel);
    const lr = rels.some((r) => r === 'jobbra' || r === 'balra');
    if (lr && rels.some((r) => SIDE_RELS.includes(r))) problems.push(`A(z) ${place} tárgynál a jobbra/balra mellett oldalt álló kép is van.`);
  }

  const claimed = new Map<number, number>();
  tasks.forEach((t, ti) => {
    if (!t) return;
    const fits = scenes.flatMap((s, ai) => (s && s.fig === t.fig && s.place === t.place && s.rel === t.rel ? [ai] : []));
    if (fits.length !== 1) {
      problems.push(`${ti + 1}. feladat: ${fits.length} kép illik a mondathoz (pontosan 1 kellene).`);
      return;
    }
    const ai = fits[0]!;
    claimed.set(ai, (claimed.get(ai) ?? 0) + 1);
    if (sheet.answers[ai]!.disc !== sheet.tasks[ti]!.disc) problems.push(`${ti + 1}. feladat: az illő kép más koronghoz van rendelve.`);
  });
  sheet.answers.forEach((_, ai) => {
    if ((claimed.get(ai) ?? 0) !== 1) problems.push(`${ai + 1}. megoldás: nem pontosan egy mondathoz tartozik.`);
  });
  return problems;
}
