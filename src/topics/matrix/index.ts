import type { Topic } from '../types';
import { CONTENT_VERSION, SIZES, generate } from './generate';
import { verify } from './verify';

export const matrix: Topic = {
  id: 'matrix',
  nameHu: 'Mátrix',
  icon: {
    t: 'grid',
    cols: 2,
    frame: true,
    items: [
      { t: 'shape', id: 'kor', fill: 'solid' },
      { t: 'shape', id: 'kor', fill: 'outline' },
      { t: 'shape', id: 'negyzet', fill: 'solid' },
      { t: 'blank' },
    ],
  },
  color: '#bfe3ff',
  sizes: SIZES,
  taskCols: 2,
  demoSize: 2,
  contentVersion: CONTENT_VERSION,
  generate,
  verify,
  instructionId: (level) => `utasitas-matrix-${level}`,
};
