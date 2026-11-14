import type { Topic } from '../types';
import { CONTENT_VERSION, SIZES, generate } from './generate';
import { verify } from './verify';

export const betu: Topic = {
  id: 'betu',
  nameHu: 'Betűkereső',
  icon: {
    t: 'seq',
    gap: 2,
    items: [
      { t: 'glyph', ch: 'A', boxed: true },
      { t: 'glyph', ch: 'B' },
      { t: 'glyph', ch: 'A' },
    ],
  },
  color: '#ffd6ec',
  sizes: SIZES,
  taskCols: 1,
  contentVersion: CONTENT_VERSION,
  generate,
  verify,
  instructionId: (level) => `utasitas-betu-${level}`,
};
