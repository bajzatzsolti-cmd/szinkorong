// Ha–akkor (tapasztalati következtetés, hallás után): a feladat egy hallott rövid következtetés
// („Ha esik az eső, esernyőt viszünk. Esik az eső. Mit viszünk?”), a megoldás egy kép.
//
// Szintek (a jóváhagyott tervezet szerint, content/haakkor.json):
//  • 1. szint (6): ha A, akkor B; A igaz (a feltétel szó szerint elhangzik).
//  • 2. szint (8): ugyanez, de a feltétel burkoltan derül ki („kopog az eső az ablakon”).
//  • 3. szint (10): vagy–vagy és tagadás; a kizárt kép szándékosan lehet a lapon.
// Csak logikailag érvényes következtetés szerepel. Egy lapon nem lehet olyan megoldás, amely egy másik
// feladat „ütközik” listáján van (a hétköznapi tapasztalat szerint az is illene, vagy elhangzik a szövegben).
import { WORD_BY_ID, isPictureSafe } from '../../data/vocab';
import { mulberry32, shuffle, type Rng } from '../../engine/rng';
import type { Sheet, SheetSpec } from '../../engine/sheet';
import { img, sayId, sheetFromPairs } from '../common';
import { ITEMS, sayOf, type Item } from './data';

export const CONTENT_VERSION = 1;
export const SIZES = [6, 8, 10] as const;

const LISTEN = { t: 'sym', id: 'listen' } as const;

const usable = (i: Item): boolean => {
  const w = WORD_BY_ID.get(i.valasz);
  return !!w && isPictureSafe(w);
};

/** Két feladat összefér-e egy lapon (különböző megoldás, és egyik megoldása sincs a másik ütközés-listáján). */
export const compatible = (a: Item, b: Item): boolean =>
  a.valasz !== b.valasz && !a.utkozik.includes(b.valasz) && !b.utkozik.includes(a.valasz);

function attempt(r: Rng, spec: SheetSpec): Item[] | null {
  const chosen: Item[] = [];
  for (const it of shuffle(r, ITEMS.filter((i) => i.szint === spec.level + 1 && usable(i)))) {
    if (chosen.every((c) => compatible(c, it))) chosen.push(it);
    if (chosen.length === spec.n) return chosen;
  }
  return null;
}

export function generate(spec: SheetSpec): Sheet {
  const r = mulberry32(spec.seed);
  for (let i = 0; i < 200; i++) {
    const items = attempt(r, spec);
    if (!items) continue;
    return sheetFromPairs(
      spec,
      r,
      items.map((it) => ({ task: LISTEN, answer: img(it.valasz), taskSay: sayOf(it.id), answerSay: sayId(it.valasz) })),
    );
  }
  throw new Error(`Ha–akkor: nincs elég összeférő feladat (${spec.level + 1}. szint, ${spec.n} korong).`);
}
