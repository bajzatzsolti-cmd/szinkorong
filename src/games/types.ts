// Nem korongos játékok (pl. Memória): saját képernyőjük van, de a kezdőlapon, a lapválasztóban és a
// haladásban ugyanúgy szerepelnek, mint a témakörök (15 lap, 3 szint).
import type { Visual } from '../render/visual';

export interface Game {
  id: string;
  nameHu: string;
  icon: Visual;
  color: string;
  instructionId(level: number): string;
}
