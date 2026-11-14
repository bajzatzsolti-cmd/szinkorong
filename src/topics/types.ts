import type { Sheet, SheetSpec, TopicId } from '../engine/sheet';
import type { Visual } from '../render/visual';

export interface Topic {
  id: TopicId;
  /** Szülőknek szóló név (szülői menü, dokumentáció). A gyerekfelületen nem jelenik meg. */
  nameHu: string;
  /** A témakör csempéjén látszó kép. */
  icon: Visual;
  /** A csempe háttérszíne. */
  color: string;
  /** Korongszám szintenként (könnyű, közepes, nehéz). */
  sizes: readonly [number, number, number];
  /** Hány oszlopban álljanak a feladatok a lap bal oldalán. */
  taskCols: 1 | 2;
  /** Ha egy generátort átírunk, ezt növelni kell: más lap lesz ugyanazon a sorszámon. */
  contentVersion: number;
  generate(spec: SheetSpec): Sheet;
  /** Szabály alapján, a generátortól függetlenül megoldja a lapot; a problémák listáját adja. */
  verify(sheet: Sheet): string[];
  /** A lap megnyitásakor felolvasott feladat hangazonosítója. */
  instructionId(level: number): string;
}
