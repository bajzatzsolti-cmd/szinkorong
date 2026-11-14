// A feladatok és megoldások deklaratív leírása („jelenetfa”), és SVG-vé alakítása.
// Ugyanezt a leírást rajzolja majd a képernyő és a nyomtatás is.
import { extent, normalize } from './lattice';
import { SHAPES, type ShapeId } from './shapes';

/** Alakzat kitöltése: telt, körvonalas (üres), halvány. */
export type Fill = 'solid' | 'outline' | 'light';
/** Alakzat színe (ha nincs megadva: a szokásos sötétkék). */
export type Tint = 'red' | 'blue' | 'yellow' | 'green' | 'purple' | 'orange';
export const TINTS: readonly Tint[] = ['red', 'blue', 'yellow', 'green', 'purple', 'orange'];
/** Kis jelek: nyíl (ebből lesz), elválasztó, „forgatva keresd”, „a tükörképét keresd”. */
export type SymId = 'arrow' | 'sep' | 'rotate' | 'mirror';
/**
 * Fél kép: true vagy 'L' = csak a bal fele látszik, 'R' = csak a jobb fele.
 * (A korábbi `half: true` jelentése változatlan: bal fél.)
 */
export type Half = boolean | 'L' | 'R';
/** Kör alakú folt a 100 × 100-as cellában (kivágott darab helye). */
export interface Spot {
  x: number;
  y: number;
  r: number;
}
/** Mérleg dőlése: melyik oldal van lent (az a nehezebb), vagy egyensúlyban. */
export type Tilt = 'left' | 'right' | 'level';

export type Visual =
  | { t: 'shape'; id: ShapeId; fill: Fill; rot?: number; flip?: boolean; scale?: number; half?: Half; tint?: Tint }
  /**
   * Szókincs-kép (OpenMoji, w-<id>) vagy az árnyéka (s-<id>); a sprite-ot a render/sprite.ts tölti be.
   * hole = a képből egy kör alakú darab ki van vágva; piece = csak ez a darab látszik (felnagyítva).
   */
  | { t: 'img'; id: string; shadow?: boolean; rot?: number; flip?: boolean; scale?: number; half?: Half; hole?: Spot; piece?: Spot }
  /** Kétkarú mérleg: a két serpenyőben lévő tárgyak és a dőlés. */
  | { t: 'balance'; left: Visual[]; right: Visual[]; tilt: Tilt }
  | { t: 'blank' } // kérdőjeles, üres hely
  | { t: 'empty' } // üres, nem kérdezett hely (pl. a sudoku másik hiányzó mezője)
  | { t: 'seq'; items: Visual[]; gap?: number }
  /** Betű vagy számjegy (1–2 karakter); boxed = kiemelt keretben (a keresett betű). */
  | { t: 'glyph'; ch: string; boxed?: boolean }
  /** Mennyiség tízes keretben (pöttyök), 0–10. */
  | { t: 'dots'; k: number }
  /** Rács: minden elem egy cellába kerül. frame = keretes cellák (mátrix). */
  | { t: 'grid'; cols: number; items: Visual[]; cell?: number; frame?: boolean }
  /** Több (2–4) egyforma méretű elem egy cellában (darabszám). */
  | { t: 'pack'; items: Visual[] }
  | { t: 'sym'; id: SymId }
  /** Rácsnégyzetekből álló alakzat ([x, y] cellák). */
  | { t: 'poly'; cells: number[][] }
  /** Vonalas, betűszerű jel (rácspontok közti [x1, y1, x2, y2] élek). */
  | { t: 'rune'; edges: number[][] };

export interface Drawn {
  w: number;
  h: number;
  svg: string;
}

const CELL = 100;
const DEFAULT_GAP = 8;
const FILL_CLASS: Record<Fill, string> = { solid: 'vs', outline: 'vo', light: 'vl' };

interface Placement {
  rot?: number;
  flip?: boolean;
  scale?: number;
}

function placementAttr(v: Placement): string {
  const tf: string[] = [];
  if (v.scale && v.scale !== 1) tf.push(`translate(50 50) scale(${v.scale}) translate(-50 -50)`);
  if (v.rot) tf.push(`rotate(${v.rot} 50 50)`);
  if (v.flip) tf.push('translate(100 0) scale(-1 1)');
  return tf.length ? ` transform="${tf.join(' ')}"` : '';
}

const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

/** Fél kép: csak az egyik fele látszik (a beágyazott svg levágja a többit), a vágás helyén szaggatott vonal. */
function halfOf(inner: string, half?: Half): string {
  if (!half) return inner;
  if (half === 'R') {
    return `<svg x="50" y="0" width="50" height="100" viewBox="50 0 50 100">${inner}</svg><path class="vcut" d="M50 6 V94"/>`;
  }
  return `<svg x="0" y="0" width="50" height="100" viewBox="0 0 50 100">${inner}</svg><path class="vcut" d="M50 6 V94"/>`;
}

/** Felnagyított, kör alakú darab a képből: a folt középre kerül, és kitölti a cella nagy részét. */
const PIECE_ZOOM = 2;
function pieceOf(inner: string, s: Spot, key: string): string {
  const id = `pc-${key}-${s.x}-${s.y}-${s.r}`.replace(/[^a-zA-Z0-9-]/g, '');
  return (
    `<defs><clipPath id="${id}"><circle cx="${s.x}" cy="${s.y}" r="${s.r}"/></clipPath></defs>` +
    `<circle class="vpiece-bg" cx="50" cy="50" r="${s.r * PIECE_ZOOM}"/>` +
    `<g transform="translate(50 50) scale(${PIECE_ZOOM}) translate(${-s.x} ${-s.y})"><g clip-path="url(#${id})">${inner}</g></g>` +
    `<circle class="vpiece" cx="50" cy="50" r="${s.r * PIECE_ZOOM}"/>`
  );
}

/** Kivágott lyuk: a folt helyén papírszínű kör szaggatott szegéllyel. */
const holeOf = (inner: string, s: Spot): string => `${inner}<circle class="vhole" cx="${s.x}" cy="${s.y}" r="${s.r}"/>`;

/** Mérleg: 300 × 200-as rajz, a nehezebb oldal lent. */
function drawBalance(v: Extract<Visual, { t: 'balance' }>): Drawn {
  const W = 300;
  const H = 200;
  const px = 150;
  const py = 70;
  const half = 105;
  const deg = v.tilt === 'left' ? -11 : v.tilt === 'right' ? 11 : 0;
  const a = (deg * Math.PI) / 180;
  const ends = [
    { x: px - half * Math.cos(a), y: py - half * Math.sin(a), items: v.left },
    { x: px + half * Math.cos(a), y: py + half * Math.sin(a), items: v.right },
  ];
  const parts: string[] = [
    `<path class="vbal-post" d="M${px} ${py} V178"/>`,
    `<path class="vbal-base" d="M${px - 40} 186 L${px} 160 L${px + 40} 186 Z"/>`,
    `<path class="vbal-beam" d="M${ends[0]!.x.toFixed(1)} ${ends[0]!.y.toFixed(1)} L${ends[1]!.x.toFixed(1)} ${ends[1]!.y.toFixed(1)}"/>`,
    `<circle class="vbal-pivot" cx="${px}" cy="${py}" r="7"/>`,
  ];
  for (const e of ends) {
    const pan = e.y + 44;
    parts.push(
      `<path class="vbal-str" d="M${e.x.toFixed(1)} ${e.y.toFixed(1)} L${(e.x - 38).toFixed(1)} ${pan.toFixed(1)} M${e.x.toFixed(1)} ${e.y.toFixed(1)} L${(e.x + 38).toFixed(1)} ${pan.toFixed(1)}"/>`,
      `<path class="vbal-pan" d="M${(e.x - 44).toFixed(1)} ${pan.toFixed(1)} Q${e.x.toFixed(1)} ${(pan + 20).toFixed(1)} ${(e.x + 44).toFixed(1)} ${pan.toFixed(1)} Z"/>`,
    );
    // A tárgyak a serpenyőn állnak, egymás mellett; összesen legfeljebb 84 széles, 64 magas helyen.
    const k = Math.max(1, e.items.length);
    const size = Math.min(64, 84 / k);
    e.items.forEach((item, i) => {
      const d = draw(item);
      const x = e.x - (k * size) / 2 + i * size;
      parts.push(`<svg x="${x.toFixed(1)}" y="${(pan - size).toFixed(1)}" width="${size.toFixed(1)}" height="${size.toFixed(1)}" viewBox="0 0 ${d.w} ${d.h}">${d.svg}</svg>`);
    });
  }
  return { w: W, h: H, svg: parts.join('') };
}

/** Az alakzat belső SVG-jelölése (100 × 100-as térben). A kitöltést a megadott osztály adja. */
export function shapeMarkup(id: ShapeId, cls: string, rot = 0, flip = false): string {
  return `<g class="${cls}"${placementAttr({ rot, flip })}>${SHAPES[id]}</g>`;
}

/** Több elem elrendezése egy 100 × 100-as cellában: méretarány és középpontok. */
const PACK: Record<number, { s: number; at: [number, number][] }> = {
  1: { s: 1, at: [[50, 50]] },
  2: { s: 0.48, at: [[26, 50], [74, 50]] },
  3: { s: 0.46, at: [[26, 27], [74, 27], [50, 73]] },
  4: { s: 0.46, at: [[26, 26], [74, 26], [26, 74], [74, 74]] },
};

function drawSym(id: SymId): Drawn {
  switch (id) {
    case 'arrow':
      return { w: 64, h: CELL, svg: '<path class="vsym" d="M8 50 H54 M40 36 L56 50 L40 64"/>' };
    case 'sep':
      return { w: 44, h: CELL, svg: '<path class="vsep" d="M22 10 V90"/>' };
    case 'rotate':
      return {
        w: 84,
        h: CELL,
        svg:
          '<circle class="vbadge rot" cx="42" cy="50" r="36"/>' +
          '<g class="vbi" transform="translate(18 26)"><path d="M38 24 A14 14 0 1 1 33.5 13.8"/><path d="M36 6 V16 H26"/></g>',
      };
    case 'mirror':
      return {
        w: 84,
        h: CELL,
        svg:
          '<circle class="vbadge mir" cx="42" cy="50" r="36"/>' +
          '<g class="vbi"><path d="M42 28 V72" stroke-dasharray="5 6"/></g>' +
          '<path class="vbf" d="M35 50 L20 38 V62 Z"/><path class="vbf" d="M49 50 L64 38 V62 Z"/>',
      };
  }
}

export function draw(v: Visual): Drawn {
  switch (v.t) {
    case 'shape': {
      const cls = `${FILL_CLASS[v.fill]}${v.tint ? ` tint-${v.tint}` : ''}`;
      return {
        w: CELL,
        h: CELL,
        svg: halfOf(`<g class="${cls}"${placementAttr(v)}>${SHAPES[v.id]}</g>`, v.half),
      };
    }
    case 'img': {
      const ref = `${v.shadow ? 's' : 'w'}-${v.id}`;
      let inner = `<g class="${v.shadow ? 'sh' : 'im'}"${placementAttr(v)}><use href="#${ref}" x="3" y="3" width="94" height="94"/></g>`;
      if (v.piece) inner = pieceOf(inner, v.piece, v.id);
      else if (v.hole) inner = holeOf(inner, v.hole);
      return { w: CELL, h: CELL, svg: halfOf(inner, v.half) };
    }
    case 'balance':
      return drawBalance(v);
    case 'empty':
      return { w: CELL, h: CELL, svg: '<rect class="vempty" x="14" y="14" width="72" height="72" rx="14"/>' };
    case 'blank':
      return {
        w: CELL,
        h: CELL,
        svg:
          '<rect class="vb" x="8" y="8" width="84" height="84" rx="16"/>' +
          '<text class="vq" x="50" y="70" text-anchor="middle">?</text>',
      };
    case 'seq': {
      const gap = v.gap ?? DEFAULT_GAP;
      const drawn = v.items.map(draw);
      const h = drawn.reduce((m, d) => Math.max(m, d.h), 0);
      let x = 0;
      const parts: string[] = [];
      for (const d of drawn) {
        parts.push(`<g transform="translate(${x} ${(h - d.h) / 2})">${d.svg}</g>`);
        x += d.w + gap;
      }
      return { w: Math.max(x - gap, 0), h, svg: parts.join('') };
    }
    case 'glyph': {
      const two = [...v.ch].length > 1;
      const text = `<text class="vg" x="50" y="${two ? 69 : 76}" text-anchor="middle" font-size="${two ? 52 : 74}">${esc(v.ch)}</text>`;
      const box = v.boxed ? '<rect class="vgbox" x="4" y="4" width="92" height="92" rx="20"/>' : '';
      return { w: CELL, h: CELL, svg: box + text };
    }
    case 'dots': {
      const parts: string[] = [];
      for (let i = 0; i < 10; i++) {
        const cx = 27 + 46 * (i % 5);
        const cy = 27 + 46 * Math.floor(i / 5);
        parts.push(
          i < v.k
            ? `<circle class="vdot-on" cx="${cx}" cy="${cy}" r="18"/>`
            : `<circle class="vdot-off" cx="${cx}" cy="${cy}" r="16"/>`,
        );
      }
      return { w: 238, h: CELL, svg: parts.join('') };
    }
    case 'grid': {
      const cell = v.cell ?? CELL;
      const rows = Math.ceil(v.items.length / v.cols);
      const pad = v.frame ? cell * 0.1 : 0;
      const parts: string[] = [];
      v.items.forEach((item, i) => {
        const x = (i % v.cols) * cell;
        const y = Math.floor(i / v.cols) * cell;
        const d = draw(item);
        if (v.frame) parts.push(`<rect class="vcell" x="${x}" y="${y}" width="${cell}" height="${cell}"/>`);
        parts.push(
          `<svg x="${x + pad}" y="${y + pad}" width="${cell - 2 * pad}" height="${cell - 2 * pad}" viewBox="0 0 ${d.w} ${d.h}">${d.svg}</svg>`,
        );
      });
      const w = v.cols * cell;
      const h = rows * cell;
      if (v.frame) parts.push(`<rect class="vframe" x="1.5" y="1.5" width="${w - 3}" height="${h - 3}" rx="6"/>`);
      return { w, h, svg: parts.join('') };
    }
    case 'pack': {
      const layout = PACK[v.items.length];
      if (!layout) throw new Error(`pack: 1–4 elem lehet, nem ${v.items.length}`);
      const parts = v.items.map((item, i) => {
        const [cx, cy] = layout.at[i] as [number, number];
        return `<g transform="translate(${cx} ${cy}) scale(${layout.s}) translate(-50 -50)">${draw(item).svg}</g>`;
      });
      return { w: CELL, h: CELL, svg: parts.join('') };
    }
    case 'sym':
      return drawSym(v.id);
    case 'poly': {
      const cells = normalize(v.cells);
      const { w, h } = extent(cells);
      const U = 21;
      const ox = 50 - (w * U) / 2;
      const oy = 50 - (h * U) / 2;
      const rects = cells
        .map(([x, y]) => `<rect x="${ox + (x as number) * U}" y="${oy + (y as number) * U}" width="${U}" height="${U}"/>`)
        .join('');
      return { w: CELL, h: CELL, svg: `<g class="vs">${rects}</g>` };
    }
    case 'rune': {
      const edges = normalize(v.edges);
      const { w, h } = extent(edges);
      const U = 27;
      const ox = 50 - (w * U) / 2;
      const oy = 50 - (h * U) / 2;
      const lines = edges
        .map((e) => {
          const [a, b, c, d] = e as [number, number, number, number];
          return `<path d="M${ox + a * U} ${oy + b * U} L${ox + c * U} ${oy + d * U}"/>`;
        })
        .join('');
      return { w: CELL, h: CELL, svg: `<g class="vr">${lines}</g>` };
    }
  }
}

/** Teljes <svg> elem: a tartalmához méretezi magát (viewBox), a befoglaló elemet kitölti. */
export function renderVisual(v: Visual, cls = ''): string {
  const d = draw(v);
  return (
    `<svg class="vis ${cls}" viewBox="0 0 ${d.w} ${d.h}" preserveAspectRatio="xMidYMid meet" ` +
    `focusable="false" aria-hidden="true">${d.svg}</svg>`
  );
}

const halfKey = (h?: Half): string => (h === 'R' ? 'R' : h ? 'L' : '-');
const spotKey = (s?: Spot): string => (s ? `${s.x},${s.y},${s.r}` : '-');

const placeKey = (v: Placement & { half?: Half }): string =>
  `${v.rot ?? 0}:${v.flip ? 1 : 0}:${v.scale ?? 1}:${halfKey(v.half)}`;

/** Egyedi, kanonikus kulcs: két vizuális elem pontosan akkor azonos, ha a kulcsuk azonos. */
export function visualKey(v: Visual): string {
  switch (v.t) {
    case 'shape':
      return `shape:${v.id}:${v.fill}:${v.tint ?? '-'}:${placeKey(v)}`;
    case 'img':
      return `img:${v.id}:${v.shadow ? 's' : 'w'}:${placeKey(v)}:h${spotKey(v.hole)}:p${spotKey(v.piece)}`;
    case 'balance':
      return `bal:${v.tilt}[${v.left.map(visualKey).join(',')}|${v.right.map(visualKey).join(',')}]`;
    case 'blank':
      return 'blank';
    case 'empty':
      return 'empty';
    case 'seq':
      return `seq[${v.items.map(visualKey).join(',')}]`;
    case 'glyph':
      return `glyph:${v.ch}:${v.boxed ? 1 : 0}`;
    case 'dots':
      return `dots:${v.k}`;
    case 'grid':
      return `grid${v.cols}${v.frame ? 'f' : ''}[${v.items.map(visualKey).join(',')}]`;
    case 'pack':
      return `pack[${v.items.map(visualKey).join(',')}]`;
    case 'sym':
      return `sym:${v.id}`;
    case 'poly':
      return `poly:${JSON.stringify(normalize(v.cells))}`;
    case 'rune':
      return `rune:${JSON.stringify(normalize(v.edges))}`;
  }
}

/** A jelenetfában szereplő szókincs-képek (a hiányzó képek ellenőrzéséhez). */
export function collectImages(v: Visual, out: { id: string; shadow: boolean }[] = []): { id: string; shadow: boolean }[] {
  if (v.t === 'img') out.push({ id: v.id, shadow: !!v.shadow });
  else if (v.t === 'seq' || v.t === 'grid' || v.t === 'pack') for (const item of v.items) collectImages(item, out);
  else if (v.t === 'balance') for (const item of [...v.left, ...v.right]) collectImages(item, out);
  return out;
}
