import { img } from '../common';
import type { Topic } from '../types';
import { CONTENT_VERSION, SIZES, generate } from './generate';
import { verify } from './verify';

export const par: Topic = {
  id: 'par',
  nameHu: 'Mi tartozik össze?',
  icon: { t: 'seq', items: [img('kutya'), img('csont')] },
  color: '#fff0a6',
  sizes: SIZES,
  taskCols: 2,
  contentVersion: CONTENT_VERSION,
  generate,
  verify,
  instructionId: (level) => `utasitas-par-${level}`,
};
