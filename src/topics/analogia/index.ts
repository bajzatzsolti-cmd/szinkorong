import type { Topic } from '../types';
import { CONTENT_VERSION, SIZES, generate } from './generate';
import { verify } from './verify';

export const analogia: Topic = {
  id: 'analogia',
  nameHu: 'Analógia',
  icon: {
    t: 'seq',
    gap: 2,
    items: [
      { t: 'shape', id: 'csillag', fill: 'solid', scale: 0.5 },
      { t: 'sym', id: 'arrow' },
      { t: 'shape', id: 'csillag', fill: 'solid' },
    ],
  },
  color: '#c8f0d4',
  sizes: SIZES,
  taskCols: 1,
  demoSize: 2,
  contentVersion: CONTENT_VERSION,
  generate,
  verify,
  instructionId: (level) => `utasitas-analogia-${level}`,
};
