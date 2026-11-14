// Rácsra rajzolt alakzatok geometriája: forgatás, tükrözés, egybevágóság.
// Kétféle alakzat van: „poly” = egységnégyzetek halmaza ([x, y] cellák), „rune” = rácspontok közti
// egységnyi szakaszok halmaza ([x1, y1, x2, y2] élek, átlós is lehet). Mindkettő számpárok listája,
// ezért ugyanazok a műveletek működnek rajtuk.
//
// Erre épül a „Tükör és forgatás” témakör: a generátor ezekkel forgat és tükröz, a verifikátor pedig
// MAGÁBÓL A RAJZBÓL (a lerajzolt cellákból / élekből) dönti el, hogy két alakzat elforgatottja vagy
// tükörképe-e egymásnak.

export type Pts = number[][];

function mapPoints(data: Pts, f: (x: number, y: number) => [number, number]): Pts {
  return data.map((e) => {
    const out: number[] = [];
    for (let i = 0; i < e.length; i += 2) out.push(...f(e[i] as number, e[i + 1] as number));
    return out;
  });
}

/** Kanonikus alak: a bal felső sarokba tolva, az élek végpontjai és az elemek sorba rendezve. */
export function normalize(data: Pts): Pts {
  let minX = Infinity;
  let minY = Infinity;
  for (const e of data) {
    for (let i = 0; i < e.length; i += 2) {
      minX = Math.min(minX, e[i] as number);
      minY = Math.min(minY, e[i + 1] as number);
    }
  }
  const moved = data.map((e) => {
    const p = e.map((v, i) => v - (i % 2 === 0 ? minX : minY));
    if (p.length === 4) {
      const [x1, y1, x2, y2] = p as [number, number, number, number];
      if (x1 > x2 || (x1 === x2 && y1 > y2)) return [x2, y2, x1, y1];
    }
    return p;
  });
  return moved.sort((a, b) => {
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return (a[i] as number) - (b[i] as number);
    }
    return 0;
  });
}

/** Forgatás 90°-kal az óramutató járása szerint (a képernyőn lefelé nő az y). */
export const rotate90 = (data: Pts): Pts => normalize(mapPoints(data, (x, y) => [-y, x]));

/** Forgatás k × 90°-kal. */
export function rotate(data: Pts, k: number): Pts {
  let out = normalize(data);
  for (let i = 0; i < ((k % 4) + 4) % 4; i++) out = rotate90(out);
  return out;
}

/** Tükrözés függőleges tengelyre (jobb–bal csere), ahogy a tükörben látszik. */
export const mirror = (data: Pts): Pts => normalize(mapPoints(data, (x, y) => [-x, y]));

/** Pontosan ez a rajz, ebben az állásban. */
export const exactKey = (data: Pts): string => JSON.stringify(normalize(data));

/** Forgatástól független kulcs: két alakzat pontosan akkor forgatható egymásba, ha ez egyezik. */
export function orientedKey(data: Pts): string {
  let best = '';
  for (let k = 0; k < 4; k++) {
    const key = exactKey(rotate(data, k));
    if (k === 0 || key < best) best = key;
  }
  return best;
}

/** Forgatástól ÉS tükrözéstől független kulcs (az alakzat „fajtája”). */
export function freeKey(data: Pts): string {
  const a = orientedKey(data);
  const b = orientedKey(mirror(data));
  return a < b ? a : b;
}

/** Királis: a tükörképe semmilyen forgatással nem vihető önmagába (mint a b és a d). */
export const isChiral = (data: Pts): boolean => orientedKey(data) !== orientedKey(mirror(data));

/** Nincs forgási szimmetriája: a négy elforgatottja négy különböző rajz. */
export const hasFourOrientations = (data: Pts): boolean =>
  new Set([0, 1, 2, 3].map((k) => exactKey(rotate(data, k)))).size === 4;

/** A normalizált alakzat befoglaló mérete rácsegységben (celláknál a cellák száma, éleknél a pontok távolsága). */
export function extent(data: Pts): { w: number; h: number } {
  const n = normalize(data);
  const isEdge = (n[0]?.length ?? 2) === 4;
  let maxX = 0;
  let maxY = 0;
  for (const e of n) {
    for (let i = 0; i < e.length; i += 2) {
      maxX = Math.max(maxX, e[i] as number);
      maxY = Math.max(maxY, e[i + 1] as number);
    }
  }
  return isEdge ? { w: maxX, h: maxY } : { w: maxX + 1, h: maxY + 1 };
}

/**
 * Vonalas jel megadása töröttvonalakkal: "0,0 0,3; 0,0 1,0 1,1" = két vonal, rácspontokon át.
 * A szakaszokat egységnyi élekre bontja (vízszintes, függőleges vagy 45°-os átló lehet).
 */
export function parseRune(spec: string): Pts {
  const seen = new Set<string>();
  const edges: Pts = [];
  for (const stroke of spec.split(';')) {
    const pts = stroke
      .trim()
      .split(/\s+/)
      .map((p) => p.split(',').map(Number) as [number, number]);
    for (let i = 0; i + 1 < pts.length; i++) {
      const [ax, ay] = pts[i] as [number, number];
      const [bx, by] = pts[i + 1] as [number, number];
      const dx = bx - ax;
      const dy = by - ay;
      if (!(dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy))) throw new Error(`Nem rácsirányú szakasz: ${stroke}`);
      const steps = Math.max(Math.abs(dx), Math.abs(dy));
      for (let s = 0; s < steps; s++) {
        const e = normalizeEdge([ax + Math.sign(dx) * s, ay + Math.sign(dy) * s, ax + Math.sign(dx) * (s + 1), ay + Math.sign(dy) * (s + 1)]);
        const key = e.join(',');
        if (!seen.has(key)) {
          seen.add(key);
          edges.push(e);
        }
      }
    }
  }
  return normalize(edges);
}

function normalizeEdge(e: number[]): number[] {
  const [x1, y1, x2, y2] = e as [number, number, number, number];
  return x1 > x2 || (x1 === x2 && y1 > y2) ? [x2, y2, x1, y1] : e;
}
