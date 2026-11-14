// „Hol van?” jelenetek: egy szereplő (szókincs-kép) és egy tárgy (saját rajz, szemből nézve) adott viszonyban.
//
// Miért saját rajz a tárgy? Az OpenMoji doboza zárt (a „benne” nem rajzolható), a széke és az ágya oldalnézetű
// (az alatta / előtte / mögötte nehezen különül el), a kosárnak füle van (zavarja a „fölötte”-t). A szemből
// rajzolt tárgyakon minden viszony egyértelműen látszik. A stílus az OpenMoji-é: fekete körvonal, tömör színek.
//
// Rajzolási szabályok (a jóváhagyott tervezet szerint, content/holvan.json):
//  • alatt: a szereplő a tárgy alatt, a földön (a tárgy lábai közt);
//  • rajta: a szereplő a tárgy tetején, érintve;  benne: csak a felső része látszik ki a tárgyból;
//  • fölött: a levegőben a tárgy fölött, nem érinti;  mellett: mellette a földön, hézaggal, teljesen látszik;
//  • előtt: nagyobb (közelebb van), és takarja a tárgy alsó részét;  mögött: a tárgy oldalt takarja a szereplőt;
//  • között: két egyforma tárgy, a szereplő középen;  jobbra / balra: a KÉPET NÉZŐ gyerek jobb / bal keze felé.

export type PlaceId = 'szek' | 'agy' | 'doboz' | 'kosar';
export type RelId = 'alatt' | 'rajta' | 'benne' | 'mellett' | 'folott' | 'elott' | 'mogott' | 'kozott' | 'jobbra' | 'balra';
export type Side = 'L' | 'R';

const OUT = 'stroke="#000" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';

interface Prop {
  w: number;
  h: number;
  /** A tárgy hátsó része (a „benne” szereplő ez ELÉ kerül) és az elülső része. */
  back: string;
  front: string;
  /** Felület, amin ülni/állni lehet (y, helyi egységben). */
  top: number;
  /** A tárgy pereme (benne: a szereplő alja e mögé bújik). */
  rim?: number;
  /** A tárgy alatti szabad hely (alatt). */
  under?: { x0: number; x1: number; y0: number; y1: number };
}

const PROPS: Record<PlaceId, Prop> = {
  // Szék szemből: háttámla, ülőlap, két láb; az ülőlap alatt szabad hely.
  szek: {
    w: 80,
    h: 100,
    back:
      `<rect x="16" y="4" width="48" height="46" rx="7" fill="#fcea2b" ${OUT}/>` +
      `<rect x="10" y="60" width="9" height="38" rx="2" fill="#a57939" ${OUT}/>` +
      `<rect x="61" y="60" width="9" height="38" rx="2" fill="#a57939" ${OUT}/>` +
      `<rect x="5" y="47" width="70" height="13" rx="4" fill="#f1b31c" ${OUT}/>`,
    front: '',
    top: 48,
    under: { x0: 19, x1: 61, y0: 61, y1: 98 },
  },
  // Ágy szemből-oldalról: fej- és lábtámla (ezek a lábak is), matrac, párna; a keret alatt szabad hely.
  agy: {
    w: 140,
    h: 90,
    back:
      `<rect x="4" y="2" width="14" height="86" rx="4" fill="#a57939" ${OUT}/>` +
      `<rect x="122" y="20" width="14" height="68" rx="4" fill="#a57939" ${OUT}/>` +
      `<rect x="14" y="36" width="112" height="10" rx="2" fill="#a57939" ${OUT}/>` +
      `<rect x="16" y="22" width="108" height="15" rx="6" fill="#92d3f5" ${OUT}/>` +
      `<rect x="20" y="14" width="28" height="12" rx="6" fill="#fff" ${OUT}/>`,
    front: '',
    top: 22,
    under: { x0: 20, x1: 120, y0: 47, y1: 88 },
  },
  // Zárt doboz szemből: tető (két összecsukott fül, középen illesztés), elülső fal. A „benne” képen nyitott (DOBOZ_NYITVA).
  doboz: {
    w: 100,
    h: 80,
    back: '',
    front:
      `<rect x="10" y="30" width="80" height="48" rx="2" fill="#f4aa41" ${OUT}/>` +
      `<rect x="6" y="22" width="88" height="10" rx="2" fill="#f7c06a" ${OUT}/>` +
      `<path d="M50 22 V32" stroke="#000" stroke-width="2.5"/>` +
      `<rect x="40" y="46" width="20" height="7" rx="3.5" fill="#8a5a1e" stroke="none"/>`,
    top: 22,
  },
  // Kosár szemből: fonott test, perem (fül nélkül, hogy a „fölötte” egyértelmű legyen).
  kosar: {
    w: 100,
    h: 80,
    back: `<rect x="12" y="20" width="76" height="10" fill="#6d4a26" ${OUT}/>`,
    front:
      `<polygon points="10,32 90,32 80,78 20,78" fill="#a57939" ${OUT}/>` +
      `<path d="M24 40 L70 74 M40 38 L80 66 M58 37 L84 52 M76 40 L30 74 M60 38 L22 64 M42 37 L16 52" stroke="#000" stroke-width="2.5" fill="none" stroke-linecap="round"/>` +
      `<rect x="4" y="24" width="92" height="10" rx="3" fill="#8b5e34" ${OUT}/>`,
    top: 24,
    rim: 30,
  },
};

/** Nyitott doboz (csak a „benne” képen): hátsó belső fal, kihajtott fülek, elülső fal. */
const DOBOZ_NYITVA: Prop = {
  w: 100,
  h: 80,
  back:
    `<polygon points="12,30 2,10 30,15 38,30" fill="#f4aa41" ${OUT}/>` +
    `<polygon points="88,30 98,10 70,15 62,30" fill="#f4aa41" ${OUT}/>` +
    `<rect x="12" y="22" width="76" height="12" fill="#b8742a" ${OUT}/>`,
  front:
    `<rect x="10" y="30" width="80" height="48" rx="2" fill="#f4aa41" ${OUT}/>` +
    `<rect x="40" y="46" width="20" height="7" rx="3.5" fill="#8a5a1e" stroke="none"/>`,
  top: 30,
  rim: 30,
};

/** A jelenet vászna (a Visual rendszer egységeiben). */
export const SCENE_W = 220;
export const SCENE_H = 140;
const GROUND = 134;
/** A szereplő alapmérete. */
const F = 52;
/** Az OpenMoji-rajzok a 72-es négyzetben kb. 6 egység belső margóval állnak: ennyivel lejjebb tesszük, hogy talajt érjenek. */
const PAD = 6 / 72;
const PROP_SCALE: Record<PlaceId, number> = { szek: 0.88, agy: 0.92, doboz: 0.95, kosar: 0.95 };

interface Placed {
  x: number;
  y: number;
  s: number;
  p: Prop;
}

const place = (id: PlaceId, cx: number, scale = 1, p: Prop = PROPS[id]): Placed => {
  const s = PROP_SCALE[id] * scale;
  return { x: cx - (p.w * s) / 2, y: GROUND - p.h * s, s, p };
};
const gx = (q: Placed, lx: number): number => q.x + lx * q.s;
const gy = (q: Placed, ly: number): number => q.y + ly * q.s;
const layer = (q: Placed, svg: string): string => (svg ? `<g transform="translate(${q.x} ${q.y}) scale(${q.s})">${svg}</g>` : '');

/** A szereplő: alsó-közép pontja (cx, bottom), mérete size. */
function figure(id: string, cx: number, bottom: number, size: number, flip = false): string {
  const x = cx - size / 2;
  const y = bottom - size + size * PAD;
  const t = flip ? ` transform="translate(${2 * cx} 0) scale(-1 1)"` : '';
  return `<use href="#w-${id}" x="${x}" y="${y}" width="${size}" height="${size}"${t}/>`;
}

const ground = `<path d="M6 ${GROUND + 1} H${SCENE_W - 6}" stroke="#c9c2ad" stroke-width="3" stroke-linecap="round"/>`;

/** Egy jelenet SVG-tartalma (SCENE_W × SCENE_H vásznon). */
export function drawScene(fig: string, placeId: PlaceId, rel: RelId, side: Side = 'R'): string {
  const parts: string[] = [ground];
  const p = PROPS[placeId];
  const dir = side === 'R' ? 1 : -1;
  switch (rel) {
    case 'alatt': {
      const q = place(placeId, SCENE_W / 2);
      const u = p.under!;
      const size = Math.min(F, (u.y1 - u.y0) * q.s * 1.05, (u.x1 - u.x0) * q.s * 0.95);
      parts.push(figure(fig, gx(q, (u.x0 + u.x1) / 2), GROUND, size), layer(q, p.back), layer(q, p.front));
      break;
    }
    case 'rajta': {
      const q = place(placeId, SCENE_W / 2);
      parts.push(layer(q, p.back), layer(q, p.front), figure(fig, SCENE_W / 2, gy(q, p.top) + 3, F * 0.85));
      break;
    }
    case 'benne': {
      // A szereplő nagyobb része kilátszik a tárgyból (a doboz ilyenkor nyitott).
      const op = placeId === 'doboz' ? DOBOZ_NYITVA : p;
      const q = place(placeId, SCENE_W / 2, 1, op);
      const size = F * 0.85;
      parts.push(layer(q, op.back), figure(fig, SCENE_W / 2, gy(q, op.rim!) + size * 0.22, size), layer(q, op.front));
      break;
    }
    case 'folott': {
      // Biztos hézag a tárgy teteje és a szereplő között (ne tűnjön „rajta”-nak).
      const q = place(placeId, SCENE_W / 2);
      const size = Math.min(F * 0.8, q.y - 12);
      parts.push(layer(q, p.back), layer(q, p.front), figure(fig, SCENE_W / 2, q.y - 10, size));
      break;
    }
    case 'mellett':
    case 'jobbra':
    case 'balra': {
      const s = rel === 'jobbra' ? 1 : rel === 'balra' ? -1 : dir;
      const q = place(placeId, SCENE_W / 2 - s * 30);
      const edge = s > 0 ? q.x + p.w * q.s : q.x;
      parts.push(layer(q, p.back), layer(q, p.front), figure(fig, edge + s * (10 + F / 2), GROUND, F, s < 0));
      break;
    }
    case 'mogott': {
      // A szereplő a tárgy egyik oldala mögül kandikál ki: kb. a fele takarva, kicsit hátrébb (feljebb).
      const q = place(placeId, SCENE_W / 2 - dir * 12);
      const edge = dir > 0 ? q.x + p.w * q.s : q.x;
      parts.push(figure(fig, edge - dir * F * 0.08, GROUND - 6, F, dir < 0), layer(q, p.back), layer(q, p.front));
      break;
    }
    case 'elott': {
      const q = place(placeId, SCENE_W / 2);
      parts.push(layer(q, p.back), layer(q, p.front), figure(fig, SCENE_W / 2 + dir * 6, GROUND + 4, F * 1.12));
      break;
    }
    case 'kozott': {
      const k = placeId === 'agy' ? 0.62 : 0.78;
      const a = place(placeId, 52, k);
      const b = place(placeId, SCENE_W - 52, k);
      parts.push(layer(a, p.back), layer(a, p.front), layer(b, p.back), layer(b, p.front), figure(fig, SCENE_W / 2, GROUND, F * 0.85));
      break;
    }
  }
  return parts.join('');
}
