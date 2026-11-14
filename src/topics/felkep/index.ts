import type { Topic } from '../types';
import { CONTENT_VERSION, SIZES, generate } from './generate';
import { verify } from './verify';

export const felkep: Topic = {
  id: 'felkep',
  nameHu: 'Fél kép, hiányzó darab',
  icon: {
    t: 'seq',
    gap: 14,
    items: [
      { t: 'img', id: 'alma', half: 'L' },
      { t: 'img', id: 'alma', half: 'R' },
    ],
  },
  color: '#ffd9cf',
  sizes: SIZES,
  taskCols: 2,
  contentVersion: CONTENT_VERSION,
  generate,
  verify,
  instructionId: (level) => `utasitas-felkep-${level}`,
};
