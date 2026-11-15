/**
 * Egy lap (vagy bármilyen adat) összes hang-azonosítója: a feladatok és megoldások say mezője, és a képeken
 * belüli say mezők is (pl. a Betűkereső betűi). A "+" jellel összefűzött sor minden része külön azonosító.
 */
export function sayIds(data: unknown, out: Set<string> = new Set()): Set<string> {
  if (Array.isArray(data)) {
    for (const x of data) sayIds(x, out);
  } else if (data && typeof data === 'object') {
    for (const [k, v] of Object.entries(data)) {
      if (k === 'say' && typeof v === 'string') for (const part of v.split('+')) out.add(part);
      else sayIds(v, out);
    }
  }
  return out;
}
