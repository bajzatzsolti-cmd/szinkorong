// Ha–akkor verifikátora: a feladat hangazonosítójából kiolvassa a hallott feladatot, és a tartalom
// (content/haakkor.json) alapján, a generátortól függetlenül ellenőrzi:
//  • a feladat a lap szintjéhez tartozik;
//  • pontosan egy megoldás a feladat válasza, és egyik megoldás sincs a feladat „ütközik” listáján;
//  • a megoldás képe használható (nincs ellenőrzésre váró adata).
import { WORD_BY_ID, isPictureSafe } from '../../data/vocab';
import type { Sheet } from '../../engine/sheet';
import { verifyCommon } from '../../engine/verify';
import { ITEM_BY_ID } from './data';
import { SIZES } from './generate';

export function verify(sheet: Sheet): string[] {
  const problems = verifyCommon(sheet, SIZES);
  const answers = sheet.answers.map((a, i) => {
    if (a.visual.t !== 'img') {
      problems.push(`${i + 1}. megoldás: nem kép.`);
      return null;
    }
    const w = WORD_BY_ID.get(a.visual.id);
    if (!w || !isPictureSafe(w)) problems.push(`${i + 1}. megoldás: a(z) ${a.visual.id} nem használható.`);
    return a.visual.id;
  });

  const claimed = new Map<number, number>();
  sheet.tasks.forEach((t, ti) => {
    const label = `${ti + 1}. feladat`;
    const item = t.say?.startsWith('haakkor-') ? ITEM_BY_ID.get(t.say.slice('haakkor-'.length)) : undefined;
    if (!item) {
      problems.push(`${label}: ismeretlen feladat (${t.say ?? '–'}).`);
      return;
    }
    if (item.szint !== sheet.spec.level + 1) problems.push(`${label}: ${item.szint}. szintű feladat a ${sheet.spec.level + 1}. szintű lapon.`);
    if (t.visual.t !== 'sym' || t.visual.id !== 'listen') problems.push(`${label}: a képe nem hangszóró.`);
    const clash = answers.filter((a) => a && item.utkozik.includes(a));
    if (clash.length) problems.push(`${label} (${item.id}): ütköző kép a lapon: ${clash.join(', ')}.`);
    const fits = answers.flatMap((a, ai) => (a === item.valasz ? [ai] : []));
    if (fits.length !== 1) {
      problems.push(`${label} (${item.id}): ${fits.length} megoldás illik (pontosan 1 kellene).`);
      return;
    }
    const ai = fits[0]!;
    claimed.set(ai, (claimed.get(ai) ?? 0) + 1);
    if (sheet.answers[ai]!.disc !== t.disc) problems.push(`${label}: az illő megoldás más koronghoz van rendelve.`);
  });
  sheet.answers.forEach((_, ai) => {
    if ((claimed.get(ai) ?? 0) !== 1) problems.push(`${ai + 1}. megoldás: nem pontosan egy feladathoz tartozik.`);
  });
  return problems;
}
