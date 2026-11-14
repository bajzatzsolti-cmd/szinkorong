import type { Topic } from '../types';
import { CONTENT_VERSION, SIZES, generate } from './generate';
import { verify } from './verify';

export const haakkor: Topic = {
  id: 'haakkor',
  nameHu: 'Ha–akkor',
  icon: { t: 'seq', gap: 4, items: [{ t: 'img', id: 'eso' }, { t: 'sym', id: 'arrow' }, { t: 'img', id: 'esernyo' }] },
  color: '#e6dcff',
  sizes: SIZES,
  taskCols: 1,
  answerWide: 'max',
  contentVersion: CONTENT_VERSION,
  generate,
  verify,
  instructionId: (level) => `utasitas-haakkor-${level}`,
};
