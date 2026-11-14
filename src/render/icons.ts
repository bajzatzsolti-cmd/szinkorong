// Kezelőgomb-ikonok (szöveg nélkül). Vonalrajzok, a színt a currentColor adja.
const svg = (body: string, extra = ''): string =>
  `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true" ${extra}>${body}</svg>`;

export const ICONS = {
  home: svg('<path d="M8 23 L24 9 L40 23"/><path d="M13 20 V38 H35 V20"/><path d="M21 38 V28 H27 V38"/>'),
  back: svg('<path d="M30 8 L14 24 L30 40"/>'),
  speaker: svg(
    '<path d="M6 18 H13 L23 10 V38 L13 30 H6 Z" fill="currentColor"/><path d="M30 17 C34 21 34 27 30 31"/><path d="M35 11 C42 17 42 31 35 37"/>',
  ),
  check: svg('<path d="M9 25 L20 36 L40 12" stroke-width="7"/>'),
  retry: svg('<path d="M38 24 A14 14 0 1 1 33.5 13.8"/><path d="M36 6 V16 H26"/>', ''),
  next: svg('<path d="M8 24 H38"/><path d="M26 11 L39 24 L26 37"/>'),
  gear: svg(
    '<circle cx="24" cy="24" r="6"/><path d="M24 5 V10 M24 38 V43 M5 24 H10 M38 24 H43 M10.6 10.6 L14.1 14.1 M33.9 33.9 L37.4 37.4 M10.6 37.4 L14.1 33.9 M33.9 14.1 L37.4 10.6" stroke-width="4"/>',
  ),
  play: svg('<path d="M17 10 L39 24 L17 38 Z" fill="currentColor"/>'),
  /** Mutató kéz a bemutatóhoz; az ujjhegy a (26, 4) pontnál van a 64 × 64-es térben. */
  hand:
    '<svg viewBox="0 0 64 64" focusable="false" aria-hidden="true"><path d="M20 8 a6 6 0 0 1 12 0 V27 l13 3 a7 7 0 0 1 5.4 8.2 l-3 14 A9 9 0 0 1 38.600 59 H27 a9 9 0 0 1 -7.200 -3.600 L7.500 39 a5 5 0 0 1 7.600 -6.400 L20 37 Z" fill="#fff" stroke="#1f2a40" stroke-width="3" stroke-linejoin="round"/></svg>',
  star: '<svg viewBox="0 0 100 100" focusable="false" aria-hidden="true"><polygon points="50,6 62,38 96,38 68,58 79,92 50,72 21,92 32,58 4,38 38,38" fill="currentColor"/></svg>',
} as const;

export type IconName = keyof typeof ICONS;
