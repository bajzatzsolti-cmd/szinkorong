// Az Analógia verifikátora: az A → B párból kikövetkezteti a viszonyt, alkalmazza C-re, és megnézi,
// hogy pontosan egy megoldás egyezik-e az eredménnyel. A generátor adataira nem támaszkodik.
import { WORD_BY_ID, isPictureSafe } from '../../data/vocab';
import type { Sheet } from '../../engine/sheet';
import { verifyCommon } from '../../engine/verify';
import { visualKey, type Visual } from '../../render/visual';
import { FLAGS, FORWARD_FROM, SIZES, type Flag, type State } from './generate';

/** A rajzból visszafejtett állapot. */
export function parseState(v: Visual): State | null {
  let double = false;
  let base = v;
  if (v.t === 'seq') {
    if (v.items.length !== 2 || visualKey(v.items[0]!) !== visualKey(v.items[1]!)) return null;
    double = true;
    base = v.items[0]!;
  }
  if (base.t !== 'img' && base.t !== 'shape') return null;
  if (base.rot || base.flip) return null;
  if (base.scale !== undefined && base.scale !== 0.5) return null;
  const common = { id: base.id, small: base.scale === 0.5, half: !!base.half, double };
  if (base.t === 'img') return { kind: 'img', ...common, outline: false, shadow: !!base.shadow };
  if (base.fill !== 'solid' && base.fill !== 'outline') return null;
  return { kind: 'shape', ...common, outline: base.fill === 'outline', shadow: false };
}

const sameState = (a: State, b: State): boolean => a.kind === b.kind && a.id === b.id && FLAGS.every((f) => a[f] === b[f]);

export function verify(sheet: Sheet): string[] {
  const problems = verifyCommon(sheet, SIZES);
  const level = sheet.spec.level;

  const answers = sheet.answers.map((a, ai) => {
    const s = parseState(a.visual);
    if (!s) problems.push(`${ai + 1}. megoldás: nem értelmezhető kép.`);
    return s;
  });

  const claimed = new Map<number, number>();
  sheet.tasks.forEach((task, ti) => {
    const label = `${ti + 1}. feladat`;
    const v = task.visual;
    if (v.t !== 'seq' || v.items.length !== 7) return void problems.push(`${label}: nem „A → B ┊ C → ?” alakú.`);
    const [va, s1, vb, s2, vc, s3, vd] = v.items as [Visual, Visual, Visual, Visual, Visual, Visual, Visual];
    const symOk = (s: Visual, id: string): boolean => s.t === 'sym' && s.id === id;
    if (!symOk(s1, 'arrow') || !symOk(s2, 'sep') || !symOk(s3, 'arrow') || vd.t !== 'blank') return void problems.push(`${label}: hiányzik a nyíl, az elválasztó vagy a kérdőjel.`);

    const a = parseState(va);
    const b = parseState(vb);
    const c = parseState(vc);
    if (!a || !b || !c) return void problems.push(`${label}: nem értelmezhető kép.`);
    if (a.kind !== b.kind || a.id !== b.id) return void problems.push(`${label}: A és B nem ugyanaz a tárgy.`);
    if (c.kind !== a.kind) problems.push(`${label}: C más fajta (kép / alakzat), mint A.`);
    if (c.id === a.id) problems.push(`${label}: C ugyanaz a tárgy, mint A (a példa elárulná a megoldást).`);

    // A viszony: pontosan egy tulajdonság változik A és B között.
    const changed = FLAGS.filter((f) => a[f] !== b[f]);
    if (changed.length !== 1) return void problems.push(`${label}: A és B között ${changed.length} tulajdonság változik (pontosan 1 kellene).`);
    const flag = changed[0] as Flag;
    if (FLAGS.some((f) => c[f] !== a[f])) return void problems.push(`${label}: C nem ugyanabban az állapotban van, mint A.`);

    const forward = a[flag] === FORWARD_FROM[flag];
    if (level < 2 && !forward) problems.push(`${label}: visszafelé irányú viszony csak a 3. szinten lehet.`);
    if (level === 0 && flag === 'half') problems.push(`${label}: az egész → fél viszony az 1. szinten nem szerepel.`);
    if (flag === 'outline' && a.kind !== 'shape') problems.push(`${label}: üres → teli csak alakzatnál lehet.`);
    if (flag === 'shadow' && a.kind !== 'img') problems.push(`${label}: kép → árnyék csak képnél lehet.`);

    for (const s of [a, c]) {
      if (s.kind !== 'img') continue;
      const w = WORD_BY_ID.get(s.id);
      if (!w) problems.push(`${label}: ismeretlen szó (${s.id}).`);
      else if (!isPictureSafe(w)) problems.push(`${label}: ${s.id} adata ellenőrzésre vár.`);
      else if (flag === 'shadow' && !w.goodShadow) problems.push(`${label}: ${s.id} árnyéka nem jó.`);
    }

    const required: State = { ...c, [flag]: b[flag] };
    const fits = answers.flatMap((s, ai) => (s && sameState(s, required) ? [ai] : []));
    if (fits.length !== 1) return void problems.push(`${label}: ${fits.length} megoldás illik (pontosan 1 kellene).`);
    const ai = fits[0] as number;
    claimed.set(ai, (claimed.get(ai) ?? 0) + 1);
    if (sheet.answers[ai]!.disc !== task.disc) problems.push(`${label}: az illő megoldás más koronghoz van rendelve.`);

    // Kerülőút-ellenőrzés: legyen a lapon más megoldás is ugyanarról a tárgyról (különben elég a tárgyat megkeresni).
    if (!answers.some((s, j) => s && j !== ai && s.kind === c.kind && s.id === c.id)) {
      problems.push(`${label}: kerülőúton is megoldható (csak egy megoldás mutatja ezt a tárgyat).`);
    }
  });

  sheet.answers.forEach((_, ai) => {
    if ((claimed.get(ai) ?? 0) !== 1) problems.push(`${ai + 1}. megoldás: nem pontosan egy feladathoz tartozik.`);
  });
  return problems;
}
