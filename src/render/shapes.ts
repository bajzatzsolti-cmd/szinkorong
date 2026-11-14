// Saját rajzolású alakzatok (100 × 100-as koordinátatér). Nincs bennük szín:
// a kitöltést és a körvonalat a CSS adja (.vs, .vo, .gl), így a nyomtatás is átszínezheti.

const poly = (n: number, r: number, rot = -90, cx = 50, cy = 50): string =>
  Array.from({ length: n }, (_, i) => {
    const a = ((rot + (360 / n) * i) * Math.PI) / 180;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(' ');

const starPoints = Array.from({ length: 10 }, (_, i) => {
  const a = ((-90 + 36 * i) * Math.PI) / 180;
  const r = i % 2 ? 19 : 45;
  return `${(50 + r * Math.cos(a)).toFixed(1)},${(53 + r * Math.sin(a)).toFixed(1)}`;
}).join(' ');

export const SHAPES = {
  kor: '<circle cx="50" cy="50" r="40"/>',
  negyzet: '<rect x="14" y="14" width="72" height="72" rx="3"/>',
  haromszog: '<polygon points="50,10 92,86 8,86"/>',
  teglalap: '<rect x="6" y="28" width="88" height="44" rx="3"/>',
  csillag: `<polygon points="${starPoints}"/>`,
  sziv: '<path d="M50 88 C10 60 6 30 26 20 C38 14 48 22 50 33 C52 22 62 14 74 20 C94 30 90 60 50 88Z"/>',
  ovalis: '<ellipse cx="50" cy="50" rx="44" ry="26"/>',
  rombusz: '<polygon points="50,6 82,50 50,94 18,50"/>',
  otszog: `<polygon points="${poly(5, 43, -90, 50, 53)}"/>`,
  hatszog: `<polygon points="${poly(6, 43, 0)}"/>`,
  felhold: '<path d="M60 10 A42 42 0 1 0 60 90 A50 50 0 0 1 60 10Z"/>',
  kereszt: '<polygon points="36,8 64,8 64,36 92,36 92,64 64,64 64,92 36,92 36,64 8,64 8,36 36,36"/>',
  felkor: '<path d="M8 70 A42 42 0 0 1 92 70Z"/>',
  trapez: '<polygon points="28,24 72,24 94,78 6,78"/>',
  nyil: '<polygon points="8,38 56,38 56,16 94,50 56,84 56,62 8,62"/>',
} as const;

export type ShapeId = keyof typeof SHAPES;

/** Egymástól jól megkülönböztethető alakzatok a Sorminta lapjaihoz (pont 10 db: a legnagyobb lapnak is elég). */
export const PATTERN_SHAPES: readonly ShapeId[] = [
  'kor', 'negyzet', 'haromszog', 'csillag', 'sziv',
  'rombusz', 'kereszt', 'hatszog', 'felhold', 'nyil',
];
