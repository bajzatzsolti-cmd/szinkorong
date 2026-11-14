// A feladatok és megoldások deklaratív leírása („jelenetfa”), és SVG-vé alakítása.
// Ugyanezt a leírást rajzolja majd a képernyő és a nyomtatás is.
import { SHAPES, type ShapeId } from './shapes';

export type Visual =
  | { t: 'shape'; id: ShapeId; fill: 'solid' | 'outline'; rot?: number; flip?: boolean }
  | { t: 'blank' } // kérdőjeles, üres hely
  | { t: 'seq'; items: Visual[]; gap?: number };

export interface Drawn {
  w: number;
  h: number;
  svg: string;
}

const CELL = 100;
const DEFAULT_GAP = 14;

/** Az alakzat belső SVG-jelölése (100 × 100-as térben). A kitöltést a megadott osztály adja. */
export function shapeMarkup(id: ShapeId, cls: string, rot = 0, flip = false): string {
  const tf: string[] = [];
  if (rot) tf.push(`rotate(${rot} 50 50)`);
  if (flip) tf.push('translate(100 0) scale(-1 1)');
  const attr = tf.length ? ` transform="${tf.join(' ')}"` : '';
  return `<g class="${cls}"${attr}>${SHAPES[id]}</g>`;
}

export function draw(v: Visual): Drawn {
  switch (v.t) {
    case 'shape':
      return {
        w: CELL,
        h: CELL,
        svg: shapeMarkup(v.id, v.fill === 'solid' ? 'vs' : 'vo', v.rot, v.flip),
      };
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
      let x = 0;
      let h = 0;
      const parts: string[] = [];
      for (const item of v.items) {
        const d = draw(item);
        parts.push(`<g transform="translate(${x} 0)">${d.svg}</g>`);
        x += d.w + gap;
        h = Math.max(h, d.h);
      }
      return { w: Math.max(x - gap, 0), h, svg: parts.join('') };
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

/** Egyedi, kanonikus kulcs: két vizuális elem pontosan akkor azonos, ha a kulcsuk azonos. */
export function visualKey(v: Visual): string {
  switch (v.t) {
    case 'shape':
      return `shape:${v.id}:${v.fill}:${v.rot ?? 0}:${v.flip ? 1 : 0}`;
    case 'blank':
      return 'blank';
    case 'seq':
      return `seq[${v.items.map(visualKey).join(',')}]`;
  }
}
