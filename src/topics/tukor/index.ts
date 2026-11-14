import { mirror } from '../../render/lattice';
import type { Topic } from '../types';
import { POLYS } from './figures';
import { CONTENT_VERSION, SIZES, generate } from './generate';
import { verify } from './verify';

const sample = POLYS.find((p) => p.id === 'f5')!.data;

export const tukor: Topic = {
  id: 'tukor',
  nameHu: 'Tükör és forgatás',
  icon: { t: 'seq', gap: 0, items: [{ t: 'poly', cells: sample }, { t: 'sym', id: 'mirror' }, { t: 'poly', cells: mirror(sample) }] },
  color: '#d9d2ff',
  sizes: SIZES,
  taskCols: 2,
  contentVersion: CONTENT_VERSION,
  generate,
  verify,
  instructionId: (level) => `utasitas-tukor-${level}`,
};
