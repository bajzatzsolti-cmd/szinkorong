import { img } from '../common';
import type { Topic } from '../types';
import { CONTENT_VERSION, SIZES, generate } from './generate';
import { verify } from './verify';

export const arnyek: Topic = {
  id: 'arnyek',
  nameHu: 'Árnyékvadász',
  icon: { t: 'seq', items: [img('cica'), img('cica', { shadow: true })] },
  color: '#ffe3a8',
  sizes: SIZES,
  taskCols: 2,
  contentVersion: CONTENT_VERSION,
  generate,
  verify,
  instructionId: (level) => `utasitas-arnyek-${level}`,
};
