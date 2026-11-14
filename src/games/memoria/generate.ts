// Memória (vizuális emlékezet): saját mechanika, nem korongos (terv, 15. kérdés, jóváhagyva).
// A képek néhány másodpercig látszanak, aztán letakarjuk őket; koppintással kell válaszolni. Egy lap = 5 kör.
//
// Szintek (ideiglenes beosztás, a szülő jóváhagyására vár):
//  • 1. szint (1–5. lap): 3 kép 5 mp-ig; „Melyik volt közöttük?”: 3 lehetőség, pontosan egy volt közöttük.
//  • 2. szint (6–10. lap): 4 kép 6 mp-ig; egy hely kérdőjelet kap: „Melyik volt itt?”: 4 lehetőség, köztük egy másik
//    látott kép is (így a helyre kell emlékezni, nem csak arra, hogy látta).
//  • 3. szint (11–15. lap): 4 kép 7 mp-ig (a 14–15. lapon 5 kép 8 mp-ig); koppints rájuk ugyanabban a sorrendben.
import { WORDS, isPictureSafe, type Word } from '../../data/vocab';
import { hashString, int, mulberry32, shuffle, type Rng } from '../../engine/rng';
import { levelOf } from '../../engine/sheet';

export const CONTENT_VERSION = 1;
export const ROUNDS = 5;

export type Mode = 'melyik' | 'hely' | 'sorrend';

export interface Round {
  mode: Mode;
  /** A megmutatott képek (szókincs-azonosítók), balról jobbra. */
  shown: string[];
  /** A választható képek. */
  options: string[];
  /** „hely”: a kérdőjeles hely sorszáma a megmutatott sorban. */
  target?: number;
}

export interface MemorySheet {
  index: number;
  level: number;
  /** Ennyi ideig látszanak a képek (ezredmásodperc). */
  showMs: number;
  rounds: Round[];
}

/** Jól megjegyezhető, egyértelmű képek (iker- és hasonló alakú képekből körönként legfeljebb egy). */
const POOL: readonly Word[] = WORDS.filter((w) => isPictureSafe(w) && w.clearName);

/** k különböző kép, különböző kategóriákból (a hasonló képek ne keveredjenek össze). */
function pickDistinct(r: Rng, k: number, avoid: ReadonlySet<string> = new Set()): Word[] {
  const out: Word[] = [];
  const cats = new Set<string>();
  const groups = new Set<string>();
  for (const w of shuffle(r, POOL)) {
    if (avoid.has(w.id) || cats.has(w.category)) continue;
    const g = w.twin ?? w.similar;
    if (g && groups.has(g)) continue;
    out.push(w);
    cats.add(w.category);
    if (g) groups.add(g);
    if (out.length === k) return out;
  }
  throw new Error(`Memória: nincs elég különböző kép (${out.length} / ${k}).`);
}

function round(r: Rng, level: number, index: number): Round {
  if (level === 0) {
    const all = pickDistinct(r, 5);
    const shown = all.slice(0, 3);
    return { mode: 'melyik', shown: shown.map((w) => w.id), options: shuffle(r, [shown[int(r, 0, 2)]!, all[3]!, all[4]!]).map((w) => w.id) };
  }
  if (level === 1) {
    const all = pickDistinct(r, 6);
    const shown = all.slice(0, 4);
    const target = int(r, 0, 3);
    const otherShown = shown[(target + int(r, 1, 3)) % 4]!;
    return {
      mode: 'hely',
      shown: shown.map((w) => w.id),
      target,
      options: shuffle(r, [shown[target]!, otherShown, all[4]!, all[5]!]).map((w) => w.id),
    };
  }
  const k = index >= 13 ? 5 : 4;
  const shown = pickDistinct(r, k).map((w) => w.id);
  let options = shuffle(r, shown);
  while (options.every((id, i) => id === shown[i])) options = shuffle(r, shown);
  return { mode: 'sorrend', shown, options };
}

export function buildMemory(index: number): MemorySheet {
  const level = levelOf(index);
  const r = mulberry32(hashString(`memoria|${index}|v${CONTENT_VERSION}`));
  return {
    index,
    level,
    showMs: level === 0 ? 5000 : level === 1 ? 6000 : index >= 13 ? 8000 : 7000,
    rounds: Array.from({ length: ROUNDS }, () => round(r, level, index)),
  };
}

/** Független ellenőrzés: minden körnek pontosan egy helyes válasza (sorrendje) van. */
export function verifyMemory(s: MemorySheet): string[] {
  const problems: string[] = [];
  if (s.rounds.length !== ROUNDS) problems.push(`A körök száma ${s.rounds.length}, kellene: ${ROUNDS}.`);
  s.rounds.forEach((rd, i) => {
    const label = `${i + 1}. kör`;
    if (new Set(rd.shown).size !== rd.shown.length) problems.push(`${label}: kétszer ugyanaz a kép.`);
    if (new Set(rd.options).size !== rd.options.length) problems.push(`${label}: két egyforma lehetőség.`);
    if (rd.mode === 'melyik') {
      const hits = rd.options.filter((o) => rd.shown.includes(o));
      if (hits.length !== 1) problems.push(`${label}: ${hits.length} lehetőség volt a képek között (pontosan 1 kellene).`);
    } else if (rd.mode === 'hely') {
      if (rd.target === undefined || rd.target < 0 || rd.target >= rd.shown.length) problems.push(`${label}: hiányzik a kérdőjeles hely.`);
      else {
        const hits = rd.options.filter((o) => o === rd.shown[rd.target!]);
        if (hits.length !== 1) problems.push(`${label}: a kérdőjeles hely képe ${hits.length}× szerepel a lehetőségek között.`);
        if (!rd.options.some((o) => o !== rd.shown[rd.target!] && rd.shown.includes(o))) problems.push(`${label}: nincs másik látott kép a lehetőségek között (elég lenne a „láttam-e” emlék).`);
      }
    } else {
      const same = rd.options.length === rd.shown.length && [...rd.options].sort().join() === [...rd.shown].sort().join();
      if (!same) problems.push(`${label}: a lehetőségek nem a megmutatott képek.`);
      if (rd.options.every((o, j) => o === rd.shown[j])) problems.push(`${label}: a lehetőségek már a helyes sorrendben állnak.`);
    }
  });
  return problems;
}
