import { img } from '../common';
import type { Topic } from '../types';
import { CONTENT_VERSION, SIZES, generate } from './generate';
import { verify } from './verify';

export const csoport: Topic = {
  id: 'csoport',
  nameHu: 'Csoportosító',
  icon: { t: 'seq', items: [img('alma'), img('korte')] },
  color: '#cfeee9',
  sizes: SIZES,
  taskCols: 2,
  contentVersion: CONTENT_VERSION,
  generate,
  verify,
  instructionId: (level) => `utasitas-csoport-${level}`,
};
