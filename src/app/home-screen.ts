import { doneCount, getSettings } from '../engine/progress';
import { SHEETS_PER_TOPIC } from '../engine/sheet';
import { DISCS, discSpan } from '../render/disc';
import { renderVisual } from '../render/visual';
import { TILES } from '../topics';
import { el, type Cleanup, type Nav } from './dom';

/** Kezdőlap: témakör-csempék (csak kép), alattuk a haladás pöttyökben. */
export function mountHome(root: HTMLElement, nav: Nav): Cleanup {
  const screen = el('section', 'screen homescreen');
  const disabled = getSettings().disabled;
  const topics = TILES.filter((t) => !disabled.includes(t.id));

  const strip = DISCS.map((d) => discSpan(d.id)).join('');
  const tiles = topics
    .map((t) => {
      const done = doneCount(t.id);
      const dots = Array.from({ length: SHEETS_PER_TOPIC }, (_, i) => `<i class="${i < done ? 'on' : ''}"></i>`).join('');
      return (
        `<button class="tile" data-topic="${t.id}" style="--tc:${t.color}" aria-label="${t.nameHu}">` +
        `<div class="tile-icon">${renderVisual(t.icon)}</div><div class="dots">${dots}</div></button>`
      );
    })
    .join('');

  screen.innerHTML = `<h1 class="sr-only">Színkorong</h1><div class="strip" aria-hidden="true">${strip}</div><div class="tiles">${tiles}</div>`;
  screen.addEventListener('click', (e) => {
    const tile = (e.target as HTMLElement).closest<HTMLElement>('.tile');
    if (tile) nav.map(tile.dataset.topic!);
  });
  root.replaceChildren(screen);
  return () => undefined;
}
