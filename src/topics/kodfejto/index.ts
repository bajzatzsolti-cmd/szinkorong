import { RUNES } from '../tukor/figures';
import type { Topic } from '../types';
import { CONTENT_VERSION, SIZES, generate } from './generate';
import { verify } from './verify';

export const kodfejto: Topic = {
  id: 'kodfejto',
  nameHu: 'Kódfejtő',
  icon: {
    t: 'seq',
    gap: 4,
    items: [{ t: 'rune', edges: RUNES[0]!.data }, { t: 'sym', id: 'arrow' }, { t: 'img', id: 'alma' }],
  },
  color: '#e0f0c8',
  sizes: SIZES,
  taskCols: 1,
  flexTaskCols: true,
  answerWide: true,
  contentVersion: CONTENT_VERSION,
  generate,
  verify,
  instructionId: (level) => `utasitas-kodfejto-${level}`,
};
