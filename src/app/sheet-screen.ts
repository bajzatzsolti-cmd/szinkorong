// A feladatlap képernyője: feladatok (bal), megoldások + üres helyek (jobb), korongtálca alul,
// ellenőrzés / újra / következő gomb. Minden felirat nélkül: csak ikonok, képek, számok.
// Ugyanez a képernyő játssza le az animált bemutatót is (demo): ott egy kéz oldja meg a példalapot.
import { attachDrag } from '../engine/drag';
import { moveWithFlip } from '../engine/flip';
import { markDemoSeen, markDone } from '../engine/progress';
import { say, sfx, stopSpeech } from '../engine/audio';
import { SHEETS_PER_TOPIC, type Sheet } from '../engine/sheet';
import { DISCS, discInner, discSpan } from '../render/disc';
import { ICONS } from '../render/icons';
import { renderVisual } from '../render/visual';
import { buildDemo, buildSheet, getTopic } from '../topics';
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

export function mountSheet(root: HTMLElement, topicId: string, index: number, nav: Nav, demo = false): Cleanup {
  const topic = getTopic(topicId);
  const sheet: Sheet = demo ? buildDemo(topic) : buildSheet(topic, index);
  const n = sheet.spec.n;

  // ---------- állapot ----------
  const slotDisc: (number | null)[] = Array(n).fill(null);
  let selected: number | null = null;
  let locked = false;
  let tries = 0;
  let mode: Mode = 'check';
  let discPx = DISC_MIN;
  let alive = true;
  const timers: number[] = [];
  let handEl: HTMLElement | null = null;

  // ---------- DOM ----------
  const screen = el('section', 'screen sheet');
  screen.dataset.topic = topic.id;
  screen.dataset.index = String(index);
  screen.dataset.n = String(n);
  if (demo) screen.dataset.demo = '1';

  const bar = el(
    'div',
    'sbar',
    `<button class="rb" data-act="back" aria-label="vissza">${ICONS.back}</button>` +
      `<div class="sbar-right">` +
      (topic.demoSize && !demo ? `<button class="rb" data-act="demo" aria-label="bemutató">${ICONS.play}</button>` : '') +
      `<button class="rb" data-act="speak" aria-label="felolvasás">${ICONS.speaker}</button></div>`,
  );
  const paper = el('div', 'paper');
  paper.style.setProperty('--tcols', String(topic.taskCols));
  const tasksEl = el('div', 'tasks');
  tasksEl.dataset.cols = String(topic.taskCols);
  const answersEl = el('div', 'answers');
  if (sheet.header) {
    const header = el('div', 'sheet-header', renderVisual(sheet.header));
    paper.classList.add('has-header');
    paper.append(header);
  }
  paper.append(tasksEl, answersEl);
  const homesEl = el('div', 'homes');
  const go = el('button', 'go');
  go.setAttribute('aria-label', 'ellenőrzés');
  screen.append(bar, paper, homesEl, go);

  const taskEls: HTMLElement[] = [];
  for (const t of sheet.tasks) {
    const row = el('div', 'task');
    row.dataset.disc = String(t.disc);
    if (t.say) row.dataset.say = t.say;
    const speaker = topic.taskSpeaker && t.say ? `<span class="tspk" aria-hidden="true">${ICONS.speaker}</span>` : '';
    row.innerHTML = `${discSpan(t.disc, 'dot')}<div class="vis-wrap">${renderVisual(t.visual)}</div>${speaker}`;
    taskEls.push(row);
    tasksEl.append(row);
  }

  const rowEls: HTMLElement[] = [];
  const slotEls: HTMLElement[] = [];
  const keyEls: HTMLElement[] = [];
  sheet.answers.forEach((a, j) => {
    const row = el('div', 'row');
    row.dataset.j = String(j);
    if (a.say) row.dataset.say = a.say;
    // A kulcs (a helyes korong jele) ellenőrzéskor a hely sarkán jelenik meg, így nem vesz el helyet a képtől.
    row.innerHTML = `<div class="vis-wrap">${renderVisual(a.visual)}</div><div class="slot-wrap"><div class="slot"></div><div class="key"></div></div>`;
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

  const placeInto = (id: number, slotIdx: number, duration?: number): void => {
    const occupant = slotDisc[slotIdx];
    if (occupant !== null && occupant !== id) sendHome(occupant!);
    const prev = slotDisc.indexOf(id);
    if (prev >= 0) slotDisc[prev] = null;
    slotDisc[slotIdx] = id;
    const b = discEls.get(id)!;
    moveWithFlip(b, () => slotEls[slotIdx]!.append(b), true, duration);
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
      canStart: () => !locked && !demo,
      slotBoxes: () => slotEls.map((s) => s.getBoundingClientRect()),
      snapRadius: () => Math.max(discPx * 1.5, 80),
      onDragStart: () => select(null),
      onHover: setHot,
      onDrop: (slot) => {
        if (slot === null) sendHome(id);
        else placeInto(id, slot);
      },
      onTap: () => {
        if (locked || demo) return;
        sfx('tap');
        select(selected === id ? null : id);
      },
    });
  }

  // Alternatív vezérlés: koppintás a korongra, majd a sorra. Ha nincs kijelölt korong, a képre
  // koppintva elhangzik a neve (csak ahol ez nem árulja el a megoldást: ezt a témakör dönti el a say mezővel).
  answersEl.addEventListener('click', (e) => {
    const row = (e.target as HTMLElement).closest<HTMLElement>('.row');
    if (!row || demo) return;
    if (!locked && selected !== null) {
      placeInto(selected, Number(row.dataset.j));
      select(null);
      return;
    }
    if (row.dataset.say) say(row.dataset.say);
  });
  tasksEl.addEventListener('click', (e) => {
    const task = (e.target as HTMLElement).closest<HTMLElement>('.task');
    if (!demo && task?.dataset.say) say(task.dataset.say);
  });
  homesEl.addEventListener('click', () => {
    if (locked || demo || selected === null) return;
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
      if (!demo) markDone(topic.id, index, tries); // a bemutató nem számít a haladásba
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
    if (demo) {
      // A bemutató alatt a gomb nem él; a végén (➜) a rendes lap nyílik meg.
      if (mode !== 'next') return;
      markDemoSeen(topic.id);
      nav.sheet(topic.id, index);
      return;
    }
    if (mode === 'check') check();
    else if (mode === 'retry') retry();
    else if (index < SHEETS_PER_TOPIC - 1) nav.sheet(topic.id, index + 1);
    else nav.map(topic.id);
  });

  const speakInstruction = (): void => say(topic.instructionId(sheet.spec.level, sheet.spec.index));
  bar.addEventListener('click', (e) => {
    const act = (e.target as HTMLElement).closest<HTMLElement>('[data-act]')?.dataset.act;
    if (act === 'back') nav.map(topic.id);
    else if (act === 'speak') speakInstruction();
    else if (act === 'demo') nav.demo(topic.id, index);
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
    if (rowH < (topic.answerRowMin ?? ROW_MIN)) {
      cols = 2;
      rows = Math.ceil(n / 2);
      rowH = (H - GAP * (rows - 1)) / rows;
    }
    paper.style.setProperty('--acols', String(cols));
    // Álló nézetben a megoldásoszlop szélesebb, ha a feladatok két oszlopban állnak (a feladat-képek bőven elférnek),
    // mert az árnyékok és a megoldás-képek különben túl kicsik lennének. Hosszú sorok (Sorminta) mellett a feladatoké a hely.
    const portrait = screen.clientHeight > screen.clientWidth;
    const acol =
      topic.answerWide === 'max'
        ? cols === 2 ? '76%' : '66%'
        : topic.answerWide
          ? cols === 2 ? '62%' : '54%'
          : cols === 2 ? '48%' : portrait && topic.taskCols === 2 ? '42%' : '34%';
    paper.style.setProperty('--acol', acol);
    answersEl.classList.toggle('two-col', cols === 2);

    // 3) Feladatok: rövid feladatsorok két oszlopba törhetnek, ha egy oszlopban túl alacsonyak lennének.
    let tcols: number = topic.taskCols;
    if (topic.flexTaskCols && tcols === 1 && (tasksEl.clientHeight - GAP * (n - 1)) / n < ROW_MIN) tcols = 2;
    paper.style.setProperty('--tcols', String(tcols));
    tasksEl.dataset.cols = String(tcols);
    const taskRows = Math.ceil(n / tcols);
    const taskRowH = (tasksEl.clientHeight - GAP * (taskRows - 1)) / taskRows;
    const slot = clamp(Math.floor(rowH - 8), SLOT_MIN, SLOT_MAX);
    const dot = clamp(Math.floor(Math.min(taskRowH, rowH) * 0.62), 32, 46);
    screen.style.setProperty('--slot', `${slot}px`);
    screen.style.setProperty('--dot', `${dot}px`);
  };

  // ---------- animált bemutató ----------
  // Szöveg nélkül: felvillan a feladat, felvillan a hozzá illő megoldás, majd egy kéz a feladat pöttyével
  // egyező korongot a megoldás mellé húzza. A végén a kéz megnyomja a pipát, és jön az ünneplés.
  const wait = (ms: number): Promise<void> =>
    new Promise((resolve, reject) => {
      timers.push(window.setTimeout(() => (alive ? resolve() : reject(new Error('megszakítva'))), ms));
    });

  const runDemo = async (): Promise<void> => {
    const hand = el('div', 'demo-hand', ICONS.hand);
    handEl = hand;
    const tipTo = (target: Element, ms: number): Promise<void> => {
      const r = target.getBoundingClientRect();
      hand.style.transition = ms ? `transform ${ms}ms cubic-bezier(.4,0,.2,1)` : 'none';
      // az ujjhegy a (26, 4) pontnál van a 64 px-es kézben
      hand.style.transform = `translate(${r.left + r.width / 2 - 26}px, ${r.top + r.height / 2 - 4}px)`;
      return wait(ms);
    };
    await tipTo(go, 0);
    document.body.append(hand);
    await wait(1200);

    for (let ti = 0; ti < sheet.tasks.length; ti++) {
      const task = sheet.tasks[ti]!;
      const ai = sheet.answers.findIndex((a) => a.disc === task.disc);
      const disc = discEls.get(task.disc)!;

      taskEls[ti]!.classList.add('demo-pulse');
      await wait(1500);
      rowEls[ai]!.classList.add('demo-pulse');
      await wait(1500);
      taskEls[ti]!.classList.remove('demo-pulse');
      rowEls[ai]!.classList.remove('demo-pulse');

      await tipTo(disc, 800);
      hand.classList.add('press');
      await wait(300);
      const slot = slotEls[ai]!;
      placeInto(task.disc, ai, 1000);
      await tipTo(slot, 1000);
      hand.classList.remove('press');
      await wait(700);
    }

    await tipTo(go, 800);
    hand.classList.add('press');
    await wait(300);
    check();
    hand.classList.remove('press');
    await wait(500);
    hand.remove();
    handEl = null;
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
  if (demo) runDemo().catch(() => undefined);

  return () => {
    alive = false;
    timers.forEach((t) => window.clearTimeout(t));
    handEl?.remove();
    ro.disconnect();
    window.removeEventListener('orientationchange', onOrientation);
    stopSpeech();
  };
}
