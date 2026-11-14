// A feladatlap képernyője: feladatok (bal), megoldások + üres helyek (jobb), korongtálca alul,
// ellenőrzés / újra / következő gomb. Minden felirat nélkül: csak ikonok, képek, számok.
import { attachDrag } from '../engine/drag';
import { moveWithFlip } from '../engine/flip';
import { markDone } from '../engine/progress';
import { say, sfx, stopSpeech } from '../engine/audio';
import { SHEETS_PER_TOPIC, type Sheet } from '../engine/sheet';
import { DISCS, discInner, discSpan } from '../render/disc';
import { ICONS } from '../render/icons';
import { renderVisual } from '../render/visual';
import { buildSheet, getTopic } from '../topics';
import { clamp, el, type Cleanup, type Nav } from './dom';

// Méretek (CSS px). A gyerekujj miatt: korong ≥ 56, üres hely ≥ 56 (a kért minimum: 52).
const DISC_MIN = 56;
const DISC_MAX = 72;
const SLOT_MIN = 56;
const SLOT_MAX = 72;
/** Ennél alacsonyabb sor már nem fér el egy oszlopban: a megoldások két oszlopba törnek. */
const ROW_MIN = 62;
const GAP = 6;

type Mode = 'check' | 'retry' | 'next';

export function mountSheet(root: HTMLElement, topicId: string, index: number, nav: Nav): Cleanup {
  const topic = getTopic(topicId);
  const sheet: Sheet = buildSheet(topic, index);
  const n = sheet.spec.n;

  // ---------- állapot ----------
  const slotDisc: (number | null)[] = Array(n).fill(null);
  let selected: number | null = null;
  let locked = false;
  let tries = 0;
  let mode: Mode = 'check';
  let discPx = DISC_MIN;

  // ---------- DOM ----------
  const screen = el('section', 'screen sheet');
  screen.dataset.topic = topic.id;
  screen.dataset.index = String(index);
  screen.dataset.n = String(n);

  const bar = el(
    'div',
    'sbar',
    `<button class="rb" data-act="back" aria-label="vissza">${ICONS.back}</button>` +
      `<button class="rb" data-act="speak" aria-label="felolvasás">${ICONS.speaker}</button>`,
  );
  const paper = el('div', 'paper');
  paper.style.setProperty('--tcols', String(topic.taskCols));
  const tasksEl = el('div', 'tasks');
  const answersEl = el('div', 'answers');
  paper.append(tasksEl, answersEl);
  const homesEl = el('div', 'homes');
  const go = el('button', 'go');
  go.setAttribute('aria-label', 'ellenőrzés');
  screen.append(bar, paper, homesEl, go);

  for (const t of sheet.tasks) {
    const row = el('div', 'task');
    row.dataset.disc = String(t.disc);
    row.innerHTML = `${discSpan(t.disc, 'dot')}<div class="vis-wrap">${renderVisual(t.visual)}</div>`;
    tasksEl.append(row);
  }

  const rowEls: HTMLElement[] = [];
  const slotEls: HTMLElement[] = [];
  const keyEls: HTMLElement[] = [];
  sheet.answers.forEach((a, j) => {
    const row = el('div', 'row');
    row.dataset.j = String(j);
    row.innerHTML = `<div class="vis-wrap">${renderVisual(a.visual)}</div><div class="slot"></div><div class="key"></div>`;
    const slot = row.querySelector<HTMLElement>('.slot')!;
    const key = row.querySelector<HTMLElement>('.key')!;
    rowEls.push(row);
    slotEls.push(slot);
    keyEls.push(key);
    answersEl.append(row);
  });

  // A korongok: a tálcán mindegyiknek saját fészke van, ide tér vissza.
  const homeEls = new Map<number, HTMLElement>();
  const discEls = new Map<number, HTMLButtonElement>();
  for (let id = 0; id < n; id++) {
    const def = DISCS[id]!;
    const home = el('div', 'home');
    const b = el('button', `disc dbtn${def.ring ? ' ring' : ''}`);
    b.style.setProperty('--c', def.hex);
    b.dataset.disc = String(id);
    b.setAttribute('aria-label', def.name);
    b.innerHTML = discInner(id);
    home.append(b);
    homesEl.append(home);
    homeEls.set(id, home);
    discEls.set(id, b);
  }

  // ---------- mozgatás ----------
  const sendHome = (id: number, animate = true): void => {
    const idx = slotDisc.indexOf(id);
    if (idx >= 0) slotDisc[idx] = null;
    const b = discEls.get(id)!;
    moveWithFlip(b, () => homeEls.get(id)!.append(b), animate);
  };

  const placeInto = (id: number, slotIdx: number): void => {
    const occupant = slotDisc[slotIdx];
    if (occupant !== null && occupant !== id) sendHome(occupant!);
    const prev = slotDisc.indexOf(id);
    if (prev >= 0) slotDisc[prev] = null;
    slotDisc[slotIdx] = id;
    const b = discEls.get(id)!;
    moveWithFlip(b, () => slotEls[slotIdx]!.append(b));
    sfx('place');
  };

  const select = (id: number | null): void => {
    selected = id;
    for (const [k, b] of discEls) b.classList.toggle('sel', k === id);
  };

  // Húzás közben csak akkor nyúlunk a DOM-hoz, ha a korong alatti hely tényleg változott (akadásmentes húzás).
  let hotSlot: number | null = null;
  const setHot = (slot: number | null): void => {
    if (slot === hotSlot) return;
    if (hotSlot !== null) slotEls[hotSlot]!.classList.remove('hot');
    if (slot !== null) slotEls[slot]!.classList.add('hot');
    hotSlot = slot;
  };

  for (const [id, b] of discEls) {
    attachDrag(b, {
      canStart: () => !locked,
      slotBoxes: () => slotEls.map((s) => s.getBoundingClientRect()),
      snapRadius: () => Math.max(discPx * 1.5, 80),
      onDragStart: () => select(null),
      onHover: setHot,
      onDrop: (slot) => {
        if (slot === null) sendHome(id);
        else placeInto(id, slot);
      },
      onTap: () => {
        if (locked) return;
        sfx('tap');
        select(selected === id ? null : id);
      },
    });
  }

  // Alternatív vezérlés: koppintás a korongra, majd a sorra.
  answersEl.addEventListener('click', (e) => {
    const row = (e.target as HTMLElement).closest<HTMLElement>('.row');
    if (!row || locked || selected === null) return;
    placeInto(selected, Number(row.dataset.j));
    select(null);
  });
  homesEl.addEventListener('click', () => {
    if (locked || selected === null) return;
    if (slotDisc.includes(selected)) sendHome(selected);
    select(null);
  });

  // ---------- ellenőrzés ----------
  const setMode = (m: Mode): void => {
    mode = m;
    go.dataset.mode = m;
    go.innerHTML = m === 'check' ? ICONS.check : m === 'retry' ? ICONS.retry : ICONS.next;
    go.setAttribute('aria-label', m === 'check' ? 'ellenőrzés' : m === 'retry' ? 'újra' : 'következő lap');
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
    setTimeout(() => box.remove(), 2600);
  };

  const check = (): void => {
    select(null);
    locked = true;
    tries++;
    let good = 0;
    sheet.answers.forEach((a, j) => {
      const placed = slotDisc[j];
      const ok = placed === a.disc;
      if (ok) good++;
      const row = rowEls[j]!;
      row.classList.remove('ok', 'bad', 'miss');
      row.classList.add(ok ? 'ok' : placed === null ? 'miss' : 'bad');
      keyEls[j]!.innerHTML = discSpan(a.disc, 'keydot');
    });
    paper.classList.add('shown');
    if (good === n) {
      markDone(topic.id, index, tries);
      sfx('ok');
      party();
      screen.classList.add('solved');
      setMode('next');
    } else {
      sfx('bad');
      setMode('retry');
    }
  };

  const retry = (): void => {
    // A hibás korongok visszamennek, a jók a helyükön maradnak.
    rowEls.forEach((row, j) => {
      const placed = slotDisc[j];
      if (row.classList.contains('bad') && placed !== null) sendHome(placed);
      row.classList.remove('ok', 'bad', 'miss');
    });
    paper.classList.remove('shown');
    locked = false;
    setMode('check');
  };

  go.addEventListener('click', () => {
    if (mode === 'check') check();
    else if (mode === 'retry') retry();
    else if (index < SHEETS_PER_TOPIC - 1) nav.sheet(topic.id, index + 1);
    else nav.map(topic.id);
  });

  const speakInstruction = (): void => say(topic.instructionId(sheet.spec.level));
  bar.addEventListener('click', (e) => {
    const act = (e.target as HTMLElement).closest<HTMLElement>('[data-act]')?.dataset.act;
    if (act === 'back') nav.map(topic.id);
    else if (act === 'speak') speakInstruction();
  });

  // ---------- elrendezés ----------
  const layout = (): void => {
    // 1) Korongméret a tálca szélességéből. Ha a legkisebb méret sem fér egy sorba, a tálca két sorba tör.
    const cs = getComputedStyle(homesEl);
    const hgap = parseFloat(cs.columnGap) || 8;
    const w = homesEl.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    discPx = clamp(Math.floor((w - hgap * (n - 1)) / n), DISC_MIN, DISC_MAX);
    screen.style.setProperty('--disc', `${discPx}px`);

    // 2) Sorok: ha egy oszlopban túl alacsony lenne a sor, a megoldások két oszlopba kerülnek.
    const H = answersEl.clientHeight;
    let cols = 1;
    let rows = n;
    let rowH = (H - GAP * (rows - 1)) / rows;
    if (rowH < ROW_MIN) {
      cols = 2;
      rows = Math.ceil(n / 2);
      rowH = (H - GAP * (rows - 1)) / rows;
    }
    paper.style.setProperty('--acols', String(cols));
    paper.style.setProperty('--acol', cols === 2 ? '48%' : '34%');
    answersEl.classList.toggle('two-col', cols === 2);

    const taskRows = Math.ceil(n / topic.taskCols);
    const taskRowH = (tasksEl.clientHeight - GAP * (taskRows - 1)) / taskRows;
    const slot = clamp(Math.floor(rowH - 8), SLOT_MIN, SLOT_MAX);
    const dot = clamp(Math.floor(Math.min(taskRowH, rowH) * 0.62), 32, 46);
    screen.style.setProperty('--slot', `${slot}px`);
    screen.style.setProperty('--dot', `${dot}px`);
  };

  root.replaceChildren(screen);
  setMode('check');
  layout();
  const ro = new ResizeObserver(layout);
  ro.observe(screen);
  const onOrientation = (): void => layout();
  window.addEventListener('orientationchange', onOrientation);

  // Minden lap megnyitásakor elhangzik a feladat (a megnyitás egy koppintás volt, így a hang elindulhat).
  speakInstruction();

  return () => {
    ro.disconnect();
    window.removeEventListener('orientationchange', onOrientation);
    stopSpeech();
  };
}
