export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  cls = '',
  html = '',
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html) e.innerHTML = html;
  return e;
}

export const clamp = (v: number, min: number, max: number): number => Math.min(max, Math.max(min, v));

/** Képernyő-életciklus: a mount egy takarító függvényt ad vissza. */
export type Cleanup = () => void;

export interface Nav {
  home(): void;
  map(topicId: string): void;
  sheet(topicId: string, index: number): void;
  /** A témakör animált bemutatója; a végén a megadott sorszámú lap nyílik meg. */
  demo(topicId: string, thenIndex: number): void;
}
