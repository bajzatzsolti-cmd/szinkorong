import type { Topic } from '../types';
import { CONTENT_VERSION, SIZES, generate } from './generate';
import { verify } from './verify';

export const minta: Topic = {
  id: 'minta',
  nameHu: 'Sorminta',
  icon: {
    t: 'seq',
    items: [
      { t: 'shape', id: 'kor', fill: 'solid' },
      { t: 'shape', id: 'negyzet', fill: 'outline' },
      { t: 'shape', id: 'kor', fill: 'solid' },
      { t: 'blank' },
    ],
  },
  color: '#ffd9a8',
  sizes: SIZES,
  taskCols: 1,
  contentVersion: CONTENT_VERSION,
  generate,
  verify,
  instructionId: (level) => `utasitas-minta-${level}`,
};
