// Hangoló plusz (beszédhanghallás): a feladat egy kép és egy jel; a jel mondja meg, mit kell keresni.
//  • kezdőhang (első doboz világít): melyik kép kezdődik ugyanazzal a hanggal;
//  • végső hang (utolsó doboz világít): melyik kép végződik ugyanazzal a hanggal;
//  • szótagszám (két ív): tapsold el a szót; a megoldás a tapsok száma, pöttyökkel.
// A feladatra koppintva elhangzik a kérdés és a szó („Melyik kezdődik ugyanazzal a hanggal, mint ez: … macska”),
// a megoldás képére koppintva a kép neve (a hangtani feladathoz kell a név, ez nem árulja el a megoldást).
//
// Szintek (ideiglenes beosztás, a szülő jóváhagyására vár):
//  • 1. szint (6): kezdőhang.
//  • 2. szint (8): végső hang.
//  • 3. szint (10): vegyes: 4 szótagszám (1–4 taps) + 3 kezdőhang + 3 végső hang.
// A rímpárok a 4b sprintben jönnek (content/rimek.json tervezet, jóváhagyás után).
import { WORDS, type Word } from '../../data/vocab';
import { mulberry32, shuffle, type Rng } from '../../engine/rng';
import type { Sheet, SheetSpec } from '../../engine/sheet';
import type { Visual } from '../../render/visual';
import { img, sayId, sheetFromPairs, type Matched } from '../common';
import { MAX_SYLLABLES, RULE_SYM, SIZES, confusable, fitsRule, shortcut, soundOf, type Rule, type SoundRule } from './rules';
import { verify } from './verify';

export const CONTENT_VERSION = 1;
export { SIZES };

/** Szintenként: hány feladat melyik szabály szerint. */
export function planFor(level: number, n: number): Record<Rule, number> {
  if (level === 0) return { kezdo: n, veg: 0, szotag: 0 };
  if (level === 1) return { kezdo: 0, veg: n, szotag: 0 };
  const szotag = Math.min(MAX_SYLLABLES, n - 2);
  const kezdo = Math.ceil((n - szotag) / 2);
  return { kezdo, veg: n - szotag - kezdo, szotag };
}

/** A feladat képe: a kép és mellette a szabály jele. */
export const taskVisual = (w: Word, rule: Rule): Visual => ({ t: 'seq', gap: 4, items: [img(w.id), { t: 'sym', id: RULE_SYM[rule] }] });

/** A feladat hangja: a kérdéssablon és a szó, egymás után. */
export const taskSay = (w: Word, rule: Rule): string => `hangolo-${rule}+${sayId(w.id)}`;

const POOL: Readonly<Record<Rule, readonly Word[]>> = {
  kezdo: WORDS.filter((w) => fitsRule(w, 'kezdo')),
  veg: WORDS.filter((w) => fitsRule(w, 'veg')),
  szotag: WORDS.filter((w) => fitsRule(w, 'szotag')),
};

function attempt(r: Rng, spec: SheetSpec): Matched[] | null {
  const plan = planFor(spec.level, spec.n);
  const used = new Set<string>();
  const twins = new Set<string>();
  const out: Matched[] = [];
  const free = (w: Word): boolean => !used.has(w.id) && !(w.twin && twins.has(w.twin));
  const take = (w: Word): void => {
    used.add(w.id);
    if (w.twin) twins.add(w.twin);
  };

  // Szótagszám: 1, 2, 3, 4 taps (mind különböző).
  for (const k of shuffle(r, [1, 2, 3, 4]).slice(0, plan.szotag)) {
    const w = shuffle(r, POOL.szotag).find((x) => x.syllables === k && free(x));
    if (!w) return null;
    take(w);
    out.push({ task: taskVisual(w, 'szotag'), answer: { t: 'dots', k }, taskSay: taskSay(w, 'szotag') });
  }

  // Hangpárok: hangonként egy pár; a lapon egy szerepben nincs két összetéveszthető hang.
  for (const rule of ['kezdo', 'veg'] as SoundRule[]) {
    const chosen: string[] = [];
    const bySound = new Map<string, Word[]>();
    for (const w of POOL[rule]) {
      const s = soundOf(w, rule);
      bySound.set(s, [...(bySound.get(s) ?? []), w]);
    }
    for (const s of shuffle(r, [...bySound.keys()])) {
      if (out.filter((p) => p.taskSay?.startsWith(`hangolo-${rule}+`)).length >= plan[rule]) break;
      if (chosen.some((c) => confusable(c, s))) continue;
      const cands = shuffle(r, bySound.get(s)!.filter(free));
      let pair: [Word, Word] | null = null;
      for (const t of cands) {
        const a = cands.find((x) => x.id !== t.id && !(t.twin && t.twin === x.twin) && !shortcut(t, x));
        if (a) {
          pair = [t, a];
          break;
        }
      }
      if (!pair) continue;
      const [t, a] = pair;
      take(t);
      take(a);
      chosen.push(s);
      out.push({ task: taskVisual(t, rule), answer: img(a.id), taskSay: taskSay(t, rule), answerSay: sayId(a.id) });
    }
    if (out.filter((p) => p.taskSay?.startsWith(`hangolo-${rule}+`)).length < plan[rule]) return null;
  }
  return shuffle(r, out);
}

export function generate(spec: SheetSpec): Sheet {
  const r = mulberry32(spec.seed);
  // Véletlen próbálkozás: a vegyes lapon a hangok a szabályok között is ütközhetnek (ezt a verifikátor
  // szigorúan ellenőrzi), ilyenkor új összeállítás jön. A lap a mag miatt így is mindig ugyanaz.
  for (let i = 0; i < 400; i++) {
    const pairs = attempt(r, spec);
    if (!pairs) continue;
    const sheet = sheetFromPairs(spec, r, pairs);
    if (verify(sheet).length === 0) return sheet;
  }
  throw new Error(`Hangoló plusz: nem sikerült lapot összeállítani (${spec.level + 1}. szint, ${spec.n} korong).`);
}
