import type { Topic } from '../types';
import { CONTENT_VERSION, SIZES, generate } from './generate';
import { verify } from './verify';

export const sudoku: Topic = {
  id: 'sudoku',
  nameHu: 'Képes sudoku',
  icon: {
    t: 'grid',
    cols: 2,
    frame: true,
    items: [
      { t: 'img', id: 'alma' },
      { t: 'img', id: 'cica' },
      { t: 'img', id: 'cica' },
      { t: 'blank' },
    ],
  },
  color: '#e3d9ff',
  sizes: SIZES,
  taskCols: 2,
  demoSize: 2,
  contentVersion: CONTENT_VERSION,
  generate,
  verify,
  instructionId: (level) => `utasitas-sudoku-${level}`,
};
