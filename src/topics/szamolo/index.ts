import type { Topic } from '../types';
import { CONTENT_VERSION, SIZES, generate, kindOf } from './generate';
import { verify } from './verify';

export const szamolo: Topic = {
  id: 'szamolo',
  nameHu: 'Számoló plusz',
  icon: {
    t: 'seq',
    gap: 4,
    items: [
      { t: 'scatter', items: [{ id: 'alma', x: 4, y: 10 }, { id: 'alma', x: 40, y: 30 }, { id: 'alma', x: 12, y: 58 }] },
      { t: 'sym', id: 'arrow' },
      { t: 'glyph', ch: '3' },
    ],
  },
  color: '#ffe3a3',
  sizes: SIZES,
  taskCols: 2,
  contentVersion: CONTENT_VERSION,
  generate,
  verify,
  instructionId: (_level, index) => `utasitas-szamolo-${kindOf(index)}`,
};
