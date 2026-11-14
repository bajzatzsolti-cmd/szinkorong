// A húzott korong „pattanása”: a legközelebbi érvényes helyet keressük a korong közepéhez.
export interface Pt {
  x: number;
  y: number;
}

export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * A (c) ponthoz legközelebbi hely sorszáma, ha a hely közepe legfeljebb maxDist-re van; különben null
 * (érvénytelen hely: a korong visszamegy a tálcára). Egyenlő távolságnál az előbbi sorszám nyer.
 */
export function nearestSlot(c: Pt, boxes: readonly Box[], maxDist: number): number | null {
  let best: number | null = null;
  let bestD = Infinity;
  boxes.forEach((b, i) => {
    const d = Math.hypot(c.x - (b.left + b.width / 2), c.y - (b.top + b.height / 2));
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  });
  return best !== null && bestD <= maxDist ? best : null;
}
