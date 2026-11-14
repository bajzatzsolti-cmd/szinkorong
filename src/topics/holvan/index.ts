import type { Topic } from '../types';
import { CONTENT_VERSION, SIZES, generate } from './generate';
import { verify } from './verify';

export const holvan: Topic = {
  id: 'holvan',
  nameHu: 'Hol van?',
  icon: { t: 'scene', fig: 'cica', place: 'szek', rel: 'alatt' },
  color: '#d7ecff',
  sizes: SIZES,
  taskCols: 1,
  answerWide: 'max',
  answerRowMin: 130,
  contentVersion: CONTENT_VERSION,
  generate,
  verify,
  instructionId: (level) => `utasitas-holvan-${level}`,
};
