// A „Hol van?” kézi tartalma (content/holvan.json): szereplők, tárgyak és viszonyaik, a hallott mondatok.
import raw from '../../../content/holvan.json' with { type: 'json' };
import type { PlaceId, RelId } from '../../render/scene';

interface HolvanJson {
  szereplok: string[];
  helyek: Record<PlaceId, { nev: string; viszonyok: RelId[] }>;
  viszonyok: Record<RelId, { nev: string; szint: number }>;
  mondatok: Record<string, string>;
}

const data = raw as unknown as HolvanJson;

export const FIGURES: readonly string[] = data.szereplok;
export const PLACES: readonly PlaceId[] = Object.keys(data.helyek) as PlaceId[];
export const relsOf = (place: PlaceId): readonly RelId[] => data.helyek[place].viszonyok;
export const SENTENCES: Readonly<Record<string, string>> = data.mondatok;

/** Mondat-azonosító: szereplő-tárgy-viszony (pl. cica-szek-alatt). */
export const sentenceId = (fig: string, place: PlaceId, rel: RelId): string => `${fig}-${place}-${rel}`;
/** A feladat hangja (content/audio/manifest.json). */
export const sayOf = (id: string): string => `holvan-${id}`;

export function parseSentenceId(id: string): { fig: string; place: PlaceId; rel: RelId } | null {
  const [fig, place, rel, ...rest] = id.split('-');
  if (!fig || !place || !rel || rest.length) return null;
  if (!FIGURES.includes(fig) || !(place in data.helyek) || !(rel in data.viszonyok)) return null;
  return { fig, place: place as PlaceId, rel: rel as RelId };
}

/** Az 1–2. szint viszonyai (jobbra/balra a 3. szinté). */
export const BASIC_RELS: readonly RelId[] = ['alatt', 'rajta', 'benne', 'mellett', 'folott', 'elott', 'mogott', 'kozott'];
/** Oldalt álló viszonyok: a jobbra/balra mellett összetéveszthetők, ezért azzal a tárggyal nem szerepelnek egy lapon. */
export const SIDE_RELS: readonly RelId[] = ['mellett', 'mogott'];
