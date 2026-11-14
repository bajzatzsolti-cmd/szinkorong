import { img } from '../common';
import type { Topic } from '../types';
import { CONTENT_VERSION, SIZES, generate } from './generate';
import { verify } from './verify';

export const hangolo: Topic = {
  id: 'hangolo',
  nameHu: 'Hangoló plusz',
  icon: { t: 'seq', gap: 4, items: [img('cica'), { t: 'sym', id: 'snd-start' }] },
  color: '#ffd9c2',
  sizes: SIZES,
  taskCols: 2,
  taskSpeaker: true,
  contentVersion: CONTENT_VERSION,
  generate,
  verify,
  instructionId: (level) => `utasitas-hangolo-${level}`,
};
