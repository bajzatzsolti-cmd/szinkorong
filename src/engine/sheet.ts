// A feladatlap adatmodellje. Minden témakör egy Sheet-et állít elő; a motor ezt jeleníti meg,
// a verifikátor ezt ellenőrzi, a nyomtatás ezt rajzolja ki.
import type { Visual } from '../render/visual';
import { hashString } from './rng';

export type TopicId = string;
/** Korong azonosító: 0..9 (lásd render/disc.ts). */
export type DiscId = number;

export const LEVELS = 3;
export const SHEETS_PER_LEVEL = 5;
export const SHEETS_PER_TOPIC = LEVELS * SHEETS_PER_LEVEL; // 15

export interface SheetSpec {
  topic: TopicId;
  /** 0 = könnyű, 1 = közepes, 2 = nehéz */
  level: number;
  /** A lap sorszáma a témakörben: 0..14 */
  index: number;
  /** A korongok (és a feladatok) száma a lapon. */
  n: number;
  seed: number;
  /** Bemutató (demo) lap: kisebb, mint a rendes lapok; a haladásba nem számít. */
  demo?: boolean;
}

export interface TaskCell {
  /** A feladat melletti pötty színe/jele = a helyes megoldás melletti korong. */
  disc: DiscId;
  visual: Visual;
  /** Hanganyag azonosító (a képre koppintva, vagy a feladat hangja). */
  say?: string;
}

export interface AnswerCell {
  /** Ide a feladathoz tartozó korongot kell húzni (a helyes korong azonosítója). */
  disc: DiscId;
  visual: Visual;
  say?: string;
}

export interface Sheet {
  spec: SheetSpec;
  /** A feladatok sorrendje a lapon (bal oldal). */
  tasks: TaskCell[];
  /** A megoldások sorrendje a lapon (jobb oldal); más sorrend, mint a feladatoké. */
  answers: AnswerCell[];
}

export const levelOf = (index: number): number => Math.floor(index / SHEETS_PER_LEVEL);

/** A lap mágja: témakör + sorszám + tartalomverzió. Verziólépés = más lapok (a haladásjelölés marad). */
export function makeSpec(
  topic: TopicId,
  index: number,
  sizes: readonly number[],
  contentVersion: number,
): SheetSpec {
  const level = levelOf(index);
  return {
    topic,
    level,
    index,
    n: sizes[level] as number,
    seed: hashString(`${topic}|${index}|v${contentVersion}`),
  };
}
