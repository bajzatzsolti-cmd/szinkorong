import type { Game } from '../types';

export const memoria: Game = {
  id: 'memoria',
  nameHu: 'Memória',
  icon: {
    t: 'seq',
    gap: 6,
    items: [{ t: 'img', id: 'alma' }, { t: 'blank' }, { t: 'img', id: 'labda' }],
  },
  color: '#cdeccf',
  instructionId: (level) => `utasitas-memoria-${level}`,
};
