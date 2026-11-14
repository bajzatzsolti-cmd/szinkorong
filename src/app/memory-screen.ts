// A Memória képernyője: felül a megmutatott képek (letakarhatók), alattuk az idő sávja, legalul a választható
// képek. Egy lap 5 kör; hibás koppintásnál a kártya megrázkódik, és újra lehet próbálni. Szöveg nincs.
import { say, sfx } from '../engine/audio';
import { markDone } from '../engine/progress';
import { SHEETS_PER_TOPIC } from '../engine/sheet';
import { buildMemory, type Round } from '../games/memoria/generate';
import { memoria } from '../games/memoria';
import { ICONS } from '../render/icons';
import { renderVisual } from '../render/visual';
import { el, type Cleanup, type Nav } from './dom';

const CUE: Record<Round['mode'], string> = { melyik: 'memoria-melyik', hely: 'memoria-hol', sorrend: 'memoria-sorrend' };

export function mountMemory(root: HTMLElement, index: number, nav: Nav): Cleanup {
  const sheet = buildMemory(index);
  const timers: number[] = [];
  const later = (fn: () => void, ms: number): void => void timers.push(window.setTimeout(fn, ms));
  let tries = 0;

  const screen = el('section', 'screen memory');
  screen.dataset.topic = memoria.id;
  screen.dataset.index = String(index);
  const bar = el(
    'div',
    'sbar',
    `<button class="rb" data-act="back" aria-label="vissza">${ICONS.back}</button>` +
      `<div class="sbar-right"><button class="rb" data-act="speak" aria-label="felolvasás">${ICONS.speaker}</button></div>`,
  );
  const paper = el('div', 'mem-paper');
  const dots = el('div', 'mem-rounds', sheet.rounds.map(() => '<i></i>').join(''));
  const row = el('div', 'mem-row');
  const timer = el('div', 'mem-timer', '<i></i>');
  const options = el('div', 'mem-options');
  paper.append(dots, row, timer, options);
  const go = el('button', 'go');
  go.dataset.mode = 'next';
  go.innerHTML = ICONS.next;
  go.setAttribute('aria-label', 'következő lap');
  go.hidden = true;
  screen.append(bar, paper, go);

  const card = (id: string, cls: string): string =>
    `<button class="mcard ${cls}" data-id="${id}"><span class="mfront">${renderVisual({ t: 'img', id })}</span>` +
    `<span class="mback" aria-hidden="true"><span class="mq">?</span></span></button>`;

  let current = 0;
  let step = 0;
  let accepting = false;

  const startRound = (i: number): void => {
    current = i;
    step = 0;
    accepting = false;
    const rd = sheet.rounds[i]!;
    [...dots.children].forEach((d, j) => d.classList.toggle('on', j < i));
    dots.children[i]?.classList.add('now');
    row.innerHTML = rd.shown.map((id) => card(id, 'up')).join('');
    row.dataset.n = String(rd.shown.length);
    options.innerHTML = '';
    options.classList.remove('shown');
    // Az idő sávja: a megmutatás ideje alatt fogy el.
    const fill = timer.firstElementChild as HTMLElement;
    fill.style.transitionDuration = '0ms';
    timer.classList.remove('run');
    void fill.offsetWidth;
    fill.style.transitionDuration = `${sheet.showMs}ms`;
    timer.classList.add('run');
    later(() => cover(rd), sheet.showMs);
  };

  const cover = (rd: Round): void => {
    [...row.children].forEach((c, j) => {
      c.classList.remove('up');
      c.classList.add('down');
      if (rd.mode === 'hely' && j === rd.target) c.classList.add('q');
    });
    options.innerHTML = rd.options.map((id) => card(id, 'up opt')).join('');
    options.dataset.n = String(rd.options.length);
    options.classList.add('shown');
    accepting = true;
    say(CUE[rd.mode]);
  };

  const finishRound = (): void => {
    accepting = false;
    [...row.children].forEach((c) => {
      c.classList.remove('down');
      c.classList.add('up');
    });
    sfx('place');
    if (current + 1 < sheet.rounds.length) later(() => startRound(current + 1), 1400);
    else later(done, 900);
  };

  const done = (): void => {
    [...dots.children].forEach((d) => d.classList.add('on'));
    markDone(memoria.id, index, tries + 1);
    sfx('ok');
    party();
    screen.classList.add('solved');
    go.hidden = false;
  };

  const party = (): void => {
    const box = el('div', 'party');
    const colors = ['#f7c81e', '#e5484d', '#2d7fe0', '#33a55a', '#f5892b', '#8b5cd6'];
    for (let i = 0; i < 18; i++) {
      const s = el('i', '', ICONS.star);
      s.style.left = `${4 + Math.random() * 90}%`;
      s.style.animationDelay = `${Math.random() * 0.5}s`;
      s.style.color = colors[i % colors.length]!;
      box.append(s);
    }
    document.body.append(box);
    later(() => box.remove(), 2600);
  };

  const wrong = (b: HTMLElement): void => {
    tries++;
    sfx('bad');
    b.classList.remove('bad');
    void b.offsetWidth;
    b.classList.add('bad');
  };

  options.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('.mcard');
    if (!b || !accepting || b.classList.contains('used') || b.classList.contains('off')) return;
    const rd = sheet.rounds[current]!;
    const id = b.dataset.id!;
    if (rd.mode === 'sorrend') {
      if (id !== rd.shown[step]) return wrong(b);
      b.classList.add('used');
      const slot = row.children[step]!;
      slot.classList.remove('down');
      slot.classList.add('up', 'ok');
      step++;
      sfx('tap');
      if (step === rd.shown.length) finishRound();
      return;
    }
    const right = rd.mode === 'melyik' ? rd.shown.includes(id) : id === rd.shown[rd.target!];
    if (!right) {
      wrong(b);
      b.classList.add('off');
      return;
    }
    b.classList.add('ok');
    finishRound();
  });

  const speakInstruction = (): void => say(memoria.instructionId(sheet.level));
  bar.addEventListener('click', (e) => {
    const act = (e.target as HTMLElement).closest<HTMLElement>('[data-act]')?.dataset.act;
    if (act === 'back') nav.map(memoria.id);
    else if (act === 'speak') speakInstruction();
  });
  go.addEventListener('click', () => {
    if (index < SHEETS_PER_TOPIC - 1) nav.sheet(memoria.id, index + 1);
    else nav.map(memoria.id);
  });

  root.replaceChildren(screen);
  speakInstruction();
  startRound(0);
  return () => timers.forEach((t) => window.clearTimeout(t));
}
