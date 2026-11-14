// A 10 korong: 6 telt és 4 gyűrűs (fehér közepű). Színtévesztő-barát: a színen kívül
// mindegyiken egyedi jel van, így fekete-fehér nyomtatásban és színtévesztéssel is megkülönböztethetők.
import { shapeMarkup, type Visual } from './visual';
import type { ShapeId } from './shapes';

export interface DiscDef {
  id: number;
  hex: string;
  ring: boolean;
  glyph: ShapeId;
  /** Szülőknek szóló név (képernyőolvasó, dokumentáció). */
  name: string;
}

export const DISCS: readonly DiscDef[] = [
  { id: 0, hex: '#e5484d', ring: false, glyph: 'csillag', name: 'piros csillag' },
  { id: 1, hex: '#f5892b', ring: false, glyph: 'haromszog', name: 'narancs háromszög' },
  { id: 2, hex: '#f7c81e', ring: false, glyph: 'negyzet', name: 'sárga négyzet' },
  { id: 3, hex: '#33a55a', ring: false, glyph: 'sziv', name: 'zöld szív' },
  { id: 4, hex: '#2d7fe0', ring: false, glyph: 'rombusz', name: 'kék rombusz' },
  { id: 5, hex: '#8b5cd6', ring: false, glyph: 'kereszt', name: 'lila kereszt' },
  { id: 6, hex: '#e5484d', ring: true, glyph: 'felhold', name: 'piros gyűrű, félhold' },
  { id: 7, hex: '#f7c81e', ring: true, glyph: 'hatszog', name: 'sárga gyűrű, hatszög' },
  { id: 8, hex: '#33a55a', ring: true, glyph: 'otszog', name: 'zöld gyűrű, ötszög' },
  { id: 9, hex: '#2d7fe0', ring: true, glyph: 'nyil', name: 'kék gyűrű, nyíl' },
];

/** Egy korong (vagy pötty / kulcs) belső HTML-je: a jel SVG-je. A színt a --c CSS-változó adja. */
export function discInner(id: number): string {
  const d = DISCS[id];
  if (!d) throw new Error(`Ismeretlen korong: ${id}`);
  return `<svg class="glyph" viewBox="0 0 100 100" focusable="false" aria-hidden="true">${shapeMarkup(d.glyph, 'gl')}</svg>`;
}

/** Kész <span> elem a korongról (nem húzható; a feladatok mellett és a megoldókulcsban használjuk). */
export function discSpan(id: number, extraClass = ''): string {
  const d = DISCS[id]!;
  return `<span class="disc ${d.ring ? 'ring' : ''} ${extraClass}" style="--c:${d.hex}">${discInner(id)}</span>`;
}

/** A korong Visual-ként (nyomtatáshoz és tesztekhez). */
export function discVisual(id: number): Visual {
  return { t: 'shape', id: DISCS[id]!.glyph, fill: 'solid' };
}
