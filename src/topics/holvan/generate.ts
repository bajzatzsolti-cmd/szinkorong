// Hol van? (relációszókincs, hallás után): a feladat egy hallott mondat („A cica a szék alatt van.”),
// a megoldás az a kép, amelyiken a szereplő ott van. A feladatra (hangszóró) koppintva elhangzik a mondat.
//
// Szintek (a jóváhagyott tervezet szerint, content/holvan.json):
//  • 1. szint (6): egy szereplő, egy tárgy, 6 alapviszony (alatt, rajta, benne, mellett, fölött, előtt, mögött, között).
//  • 2. szint (8): egy szereplő, két tárgy, 4 + 4 alapviszony.
//  • 3. szint (10): egy szereplő, két tárgy, tárgyanként jobbra + balra + 3 másik; a mellett és a mögött kimarad
//    (oldalt álló képek, a jobbra/balra mellett összetéveszthetők).
// Egy lapon minden képen ugyanaz a szereplő: csak a viszonyszó (és a tárgy) dönt.
import { mulberry32, pick, shuffle, type Rng } from '../../engine/rng';
import type { Sheet, SheetSpec } from '../../engine/sheet';
import type { PlaceId, RelId, Side } from '../../render/scene';
import { sheetFromPairs, type Matched } from '../common';
import { BASIC_RELS, FIGURES, PLACES, SENTENCES, SIDE_RELS, relsOf, sayOf, sentenceId } from './data';

export const CONTENT_VERSION = 1;
export const SIZES = [6, 8, 10] as const;

const LISTEN = { t: 'sym', id: 'listen' } as const;

/** Tárgyanként a választható viszonyok a szinten. */
function relPool(level: number, place: PlaceId): RelId[] {
  const own = relsOf(place);
  if (level < 2) return own.filter((r) => BASIC_RELS.includes(r));
  return own.filter((r) => r !== 'jobbra' && r !== 'balra' && !SIDE_RELS.includes(r));
}

function attempt(r: Rng, spec: SheetSpec): Matched[] | null {
  const fig = pick(r, FIGURES);
  const places = spec.level === 0 ? [pick(r, PLACES)] : shuffle(r, PLACES).slice(0, 2);
  const per = spec.level === 0 ? [spec.n] : [Math.ceil(spec.n / 2), Math.floor(spec.n / 2)];
  const out: Matched[] = [];
  places.forEach((place, i) => {
    let rels: RelId[];
    if (spec.level < 2) rels = shuffle(r, relPool(spec.level, place)).slice(0, per[i]);
    else rels = ['jobbra', 'balra', ...shuffle(r, relPool(spec.level, place)).slice(0, per[i]! - 2)] as RelId[];
    for (const rel of rels) {
      const id = sentenceId(fig, place, rel);
      if (!SENTENCES[id]) continue;
      const side: Side = r() < 0.5 ? 'L' : 'R';
      out.push({
        task: LISTEN,
        answer: { t: 'scene', fig, place, rel, ...(rel === 'mellett' || rel === 'mogott' || rel === 'elott' ? { side } : {}) },
        taskSay: sayOf(id),
      });
    }
  });
  return out.length === spec.n ? shuffle(r, out) : null;
}

export function generate(spec: SheetSpec): Sheet {
  const r = mulberry32(spec.seed);
  for (let i = 0; i < 200; i++) {
    const pairs = attempt(r, spec);
    if (pairs) return sheetFromPairs(spec, r, pairs);
  }
  throw new Error(`Hol van?: nincs elég viszony a lapra (${spec.level + 1}. szint, ${spec.n} korong).`);
}
