import { isDemoSeen, isDone, nextUndone } from '../engine/progress';
import { LEVELS, SHEETS_PER_LEVEL, SHEETS_PER_TOPIC } from '../engine/sheet';
import { discSpan } from '../render/disc';
import { ICONS } from '../render/icons';
import { renderVisual } from '../render/visual';
import { getTopic } from '../topics';
import { el, type Cleanup, type Nav } from './dom';

/** Lapválasztó: 3 sáv (könnyű, közepes, nehéz) × 5 lap. A nehézséget 1–3 korong jelzi. */
export function mountMap(root: HTMLElement, topicId: string, nav: Nav): Cleanup {
  const topic = getTopic(topicId);
  const next = nextUndone(topic.id, SHEETS_PER_TOPIC);
  const screen = el('section', 'screen map');
  screen.dataset.topic = topic.id;

  let bands = '';
  for (let l = 0; l < LEVELS; l++) {
    const marks = Array.from({ length: l + 1 }, (_, i) => discSpan(i)).join('');
    let cards = '';
    for (let k = 0; k < SHEETS_PER_LEVEL; k++) {
      const i = l * SHEETS_PER_LEVEL + k;
      const done = isDone(topic.id, i);
      const cls = `card${done ? ' done' : ''}${i === next && !done ? ' next' : ''}`;
      cards += `<button class="${cls}" data-index="${i}" aria-label="${i + 1}"><span class="num">${i + 1}</span>${done ? `<span class="star">${ICONS.star}</span>` : ''}</button>`;
    }
    bands += `<div class="band" data-level="${l}"><div class="band-mark" aria-hidden="true">${marks}</div><div class="cards">${cards}</div></div>`;
  }

  screen.innerHTML =
    `<div class="mbar"><button class="rb" data-act="home" aria-label="kezdőlap">${ICONS.home}</button>` +
    `<div class="micon" style="--tc:${topic.color}">${renderVisual(topic.icon)}</div></div>` +
    `<div class="mbody">${bands}</div>`;

  screen.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    if (t.closest('[data-act="home"]')) return nav.home();
    const card = t.closest<HTMLElement>('.card');
    if (!card) return;
    const index = Number(card.dataset.index);
    // A nehezebb logikai témakörök első lapja előtt egyszer lejátszódik az animált bemutató.
    if (index === 0 && topic.demoSize && !isDemoSeen(topic.id)) nav.demo(topic.id, 0);
    else nav.sheet(topic.id, index);
  });
  root.replaceChildren(screen);
  return () => undefined;
}
