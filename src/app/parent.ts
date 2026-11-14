// Szülői funkciók: a sarokban lévő gomb 3 másodperces hosszú nyomás mögött nyílik.
// Szöveg csak itt van, kicsi és másodlagos; a gyerek felülete szövegmentes marad.
import { setVolume, sfx } from '../engine/audio';
import { getSettings, resetProgress, updateSettings } from '../engine/progress';
import { ICONS } from '../render/icons';
import { TILES } from '../topics';
import { SHEETS_PER_LEVEL } from '../engine/sheet';
import { renderAbout } from './about';
import { el } from './dom';
import { renderHangproba } from './hangproba';
import { PRINTABLE, printSheets, type KeyMode } from './print';
import { renderPlayers } from './profile-ui';
import { activeProfile } from '../engine/profiles';

const esc = (s: string): string => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

export const HOLD_MS = 3000;

export function installParentButton(onClose: () => void): void {
  const btn = el(
    'button',
    'parent-btn',
    `${ICONS.gear.replace('<svg', '<svg class="gear"')}` +
      '<svg class="ring" viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="22"/></svg>',
  );
  btn.setAttribute('aria-label', 'Szülői menü (tartsd nyomva 3 másodpercig)');
  btn.dataset.testid = 'parent-btn';
  document.body.append(btn);

  let timer: number | undefined;
  const cancel = (): void => {
    if (timer !== undefined) window.clearTimeout(timer);
    timer = undefined;
    btn.classList.remove('holding');
  };
  btn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    cancel();
    btn.classList.add('holding');
    timer = window.setTimeout(() => {
      cancel();
      openPanel(onClose);
    }, HOLD_MS);
  });
  for (const type of ['pointerup', 'pointercancel', 'pointerleave']) btn.addEventListener(type, cancel);
}

function openPanel(onClose: () => void): void {
  if (document.querySelector('.pov')) return;
  const settings = getSettings();
  const overlay = el('div', 'pov');
  overlay.dataset.testid = 'parent-panel';

  const topicRows = TILES.map(
    (t) =>
      `<label class="prow"><input type="checkbox" data-topic="${t.id}" ${settings.disabled.includes(t.id) ? '' : 'checked'}> ${t.nameHu}</label>`,
  ).join('');
  const printTopics = PRINTABLE.map((t) => `<option value="${t.id}">${t.nameHu}</option>`).join('');
  const printBox =
    `<div class="pprint">` +
    `<label class="prow col">Témakör<select data-print="topic">${printTopics}</select></label>` +
    `<div class="prow wrap">Lapok: ` +
    `<label><input type="checkbox" data-print="lvl" value="0" checked> könnyű (1–5)</label>` +
    `<label><input type="checkbox" data-print="lvl" value="1" checked> közepes (6–10)</label>` +
    `<label><input type="checkbox" data-print="lvl" value="2" checked> nehéz (11–15)</label></div>` +
    `<div class="prow wrap">Megoldókulcs: ` +
    `<label><input type="radio" name="pkey" value="end" checked> a végén, külön oldalon</label>` +
    `<label><input type="radio" name="pkey" value="back"> minden lap után (kétoldalas nyomtatáshoz)</label>` +
    `<label><input type="radio" name="pkey" value="none"> nincs</label></div>` +
    `<button class="pbtn" data-act="print">Nyomtatás (A4)</button>` +
    `<p class="pnote">Számítógépről: a nyomtatási ablakban A4, álló, és kapcsold be a „Háttérgrafikák” (háttérszínek) nyomtatását, ` +
    `hogy a pöttyök színesek legyenek. Fekete-fehérben is használható: minden pöttyön saját jel van. ` +
    `A hallás utáni témakörök és a Memória nem nyomtathatók.</p></div>`;

  overlay.innerHTML =
    `<div class="pcard" data-scroll>` +
    `<h2>Szülői beállítások</h2>` +
    `<div class="psec">Játékos</div>` +
    `<button class="pbtn" data-act="players">${esc(activeProfile().name)} · játékosok kezelése, szinkron</button>` +
    `<label class="prow col">Hangerő<input type="range" min="0" max="100" value="${Math.round(settings.volume * 100)}" data-act="volume"></label>` +
    `<div class="psec">Témakörök (a kikapcsoltak nem látszanak a kezdőlapon)</div>${topicRows}` +
    `<div class="psec">Haladás</div>` +
    `<button class="pbtn danger" data-act="reset">Haladás törlése</button>` +
    `<div class="psec">Hangok</div>` +
    `<button class="pbtn" data-act="hangproba">Hangpróba: minden hang meghallgatása, rossz jelölése</button>` +
    `<div class="psec">Nyomtatás</div>${printBox}` +
    `<div class="psec">Névjegy</div>` +
    `<button class="pbtn" data-act="about">Névjegy, licencek, adatvédelem</button>` +
    `<div class="pfoot"><span>Színkorong ${typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : ''}<br>` +
    `Képek: OpenMoji (openmoji.org), CC BY-SA 4.0</span>` +
    `<button class="pbtn primary" data-act="close">Bezár</button></div></div>`;
  document.body.append(overlay);

  const close = (): void => {
    overlay.remove();
    onClose();
  };

  let resetArmed: number | undefined;
  overlay.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    if (t === overlay) return close();
    const act = t.closest<HTMLElement>('[data-act]')?.dataset.act;
    if (act === 'close') close();
    if (act === 'print') {
      const topicId = overlay.querySelector<HTMLSelectElement>('[data-print="topic"]')!.value;
      const levels = [...overlay.querySelectorAll<HTMLInputElement>('[data-print="lvl"]:checked')].map((x) => Number(x.value));
      const key = (overlay.querySelector<HTMLInputElement>('input[name="pkey"]:checked')?.value ?? 'end') as KeyMode;
      const indices = levels.flatMap((l) => Array.from({ length: SHEETS_PER_LEVEL }, (_, k) => l * SHEETS_PER_LEVEL + k));
      if (indices.length) printSheets({ topicId, indices, key });
      return;
    }
    if (act === 'players') {
      e.stopPropagation();
      renderPlayers(overlay.querySelector<HTMLElement>('.pcard')!, () => {
        overlay.remove();
        openPanel(onClose);
      });
      return;
    }
    if (act === 'about') {
      e.stopPropagation();
      renderAbout(overlay.querySelector<HTMLElement>('.pcard')!, () => {
        overlay.remove();
        openPanel(onClose);
      });
      return;
    }
    if (act === 'hangproba') {
      // A Hangpróba ugyanabban a kártyában nyílik; a „Vissza” újranyitja a beállításokat.
      e.stopPropagation();
      const card = overlay.querySelector<HTMLElement>('.pcard')!;
      renderHangproba(card, () => {
        overlay.remove();
        openPanel(onClose);
      });
      return;
    }
    if (act === 'reset') {
      const b = t.closest<HTMLButtonElement>('[data-act]')!;
      if (resetArmed === undefined) {
        b.textContent = 'Biztosan törlöd? Nyomd meg még egyszer.';
        resetArmed = window.setTimeout(() => {
          resetArmed = undefined;
          b.textContent = 'Haladás törlése';
        }, 4000);
      } else {
        window.clearTimeout(resetArmed);
        resetArmed = undefined;
        resetProgress();
        b.textContent = 'Törölve.';
      }
    }
  });
  overlay.addEventListener('input', (e) => {
    const t = e.target as HTMLInputElement;
    if (t.dataset.act === 'volume') {
      const v = Number(t.value) / 100;
      setVolume(v);
      updateSettings({ volume: v });
    }
  });
  overlay.addEventListener('change', (e) => {
    const t = e.target as HTMLInputElement;
    if (t.dataset.act === 'volume') sfx('place');
    if (t.dataset.topic) {
      const off = new Set(getSettings().disabled);
      if (t.checked) off.delete(t.dataset.topic);
      else off.add(t.dataset.topic);
      updateSettings({ disabled: [...off] });
    }
  });
}
