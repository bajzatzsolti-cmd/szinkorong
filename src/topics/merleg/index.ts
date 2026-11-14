import type { Topic } from '../types';
import { CONTENT_VERSION, SIZES, generate } from './generate';
import { verify } from './verify';

export const merleg: Topic = {
  id: 'merleg',
  nameHu: 'Mérleg',
  icon: { t: 'balance', left: [{ t: 'img', id: 'elefant' }], right: [{ t: 'img', id: 'eger' }], tilt: 'left' },
  color: '#d6ecff',
  sizes: SIZES,
  taskCols: 2,
  contentVersion: CONTENT_VERSION,
  generate,
  verify,
  instructionId: (level) => `utasitas-merleg-${level}`,
};
