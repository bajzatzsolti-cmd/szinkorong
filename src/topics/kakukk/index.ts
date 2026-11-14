import type { Topic } from '../types';
import { CONTENT_VERSION, SIZES, generate } from './generate';
import { verify } from './verify';

export const kakukk: Topic = {
  id: 'kakukk',
  nameHu: 'Kakukktojás',
  icon: {
    t: 'seq',
    gap: 4,
    items: [
      { t: 'img', id: 'alma' },
      { t: 'img', id: 'korte' },
      { t: 'img', id: 'auto' },
      { t: 'img', id: 'banan' },
    ],
  },
  color: '#ffe0b8',
  sizes: SIZES,
  taskCols: 1,
  contentVersion: CONTENT_VERSION,
  generate,
  verify,
  instructionId: (level) => `utasitas-kakukk-${level}`,
};
