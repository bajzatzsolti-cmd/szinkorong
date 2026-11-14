// Nyomtatható lapok (A4, álló): a szülői menüből, számítógépről (a böngésző nyomtatási ablakával).
//  • laponként egy oldal: balra a feladatok a korong-pöttyel, jobbra a megoldások egy-egy üres körrel,
//    alul a lapon használt korongok jelmagyarázata (a gyerek kiszínezi a kört, vagy belerajzolja a jelet);
//  • fekete-fehér nyomtatón is használható: minden korongon saját jel van (csillag, háromszög, …);
//  • megoldókulcs: a végén külön oldalon (színsor laponként), vagy minden lap után (kétoldalas nyomtatáshoz);
//  • a hallás utáni témakörök és a Memória kimaradnak (terv: „Nyomtatható változat”).
import type { Sheet } from '../engine/sheet';
import { levelOf } from '../engine/sheet';
import { discSpan } from '../render/disc';
import { renderVisual } from '../render/visual';
import { TOPICS, buildSheet, getTopic } from '../topics';

/** Hallás utáni témakörök: a feladat hang, papíron nem működik. */
const AUDIO_ONLY = new Set(['holvan', 'haakkor', 'hangolo']);
export const PRINTABLE = TOPICS.filter((t) => !AUDIO_ONLY.has(t.id));

export type KeyMode = 'end' | 'back' | 'none';
export interface PrintOptions {
  topicId: string;
  indices: number[];
  key: KeyMode;
}

const LEVEL_NAME = ['könnyű', 'közepes', 'nehéz'];
const esc = (s: string): string => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

function sheetPage(name: string, index: number, s: Sheet): string {
  const n = s.spec.n;
  const tasks = s.tasks
    .map((t) => `<div class="pp-task">${discSpan(t.disc, 'pdot')}<div class="pp-vis">${renderVisual(t.visual)}</div></div>`)
    .join('');
  const answers = s.answers
    .map((a) => `<div class="pp-ans"><div class="pp-vis">${renderVisual(a.visual)}</div><span class="pp-circle"></span></div>`)
    .join('');
  const legend = Array.from({ length: n }, (_, d) => discSpan(d, 'pleg')).join('');
  return (
    `<section class="pp" data-n="${n}">` +
    `<header class="pp-head"><span>Színkorong · ${esc(name)}</span><span>${index + 1}. lap · ${LEVEL_NAME[levelOf(index)]}</span></header>` +
    (s.header ? `<div class="pp-sheethead">${renderVisual(s.header)}</div>` : '') +
    `<div class="pp-grid" style="--n:${n}"><div class="pp-col">${tasks}</div><div class="pp-col">${answers}</div></div>` +
    `<footer class="pp-foot"><div class="pp-legend">${legend}</div>` +
    `<p>Színezd ki a megoldás melletti kört annak a pöttynek a színével, amelyik a feladat mellett van (vagy rajzold bele a jelét).</p></footer>` +
    `</section>`
  );
}

/** Egy lap kulcsa a lap hátoldalára: a megoldások ugyanabban a sorrendben, a helyes koronggal a körben. */
function keyBackPage(name: string, index: number, s: Sheet): string {
  const rows = s.answers
    .map((a) => `<div class="pp-ans"><div class="pp-vis">${renderVisual(a.visual)}</div>${discSpan(a.disc, 'pkey')}</div>`)
    .join('');
  return (
    `<section class="pp pp-keypage" data-n="${s.spec.n}">` +
    `<header class="pp-head"><span>Megoldókulcs · ${esc(name)}</span><span>${index + 1}. lap</span></header>` +
    `<div class="pp-grid pp-grid-key" style="--n:${s.spec.n}"><div class="pp-col">${rows}</div></div></section>`
  );
}

/** Kulcs a végén: laponként egy sor, a megoldások sorrendjében (fentről lefelé) a helyes korongok színsora. */
function keyEndPages(name: string, sheets: { index: number; s: Sheet }[]): string {
  const PER_PAGE = 15;
  let out = '';
  for (let p = 0; p < sheets.length; p += PER_PAGE) {
    const rows = sheets
      .slice(p, p + PER_PAGE)
      .map(({ index, s }) => `<div class="pp-keyrow"><span class="pp-keylabel">${index + 1}. lap</span>${s.answers.map((a) => discSpan(a.disc, 'pseq')).join('')}</div>`)
      .join('');
    out +=
      `<section class="pp pp-keyend">` +
      `<header class="pp-head"><span>Megoldókulcs · ${esc(name)}</span><span>a megoldások sorrendjében, fentről lefelé</span></header>` +
      `<div class="pp-keyrows">${rows}</div></section>`;
  }
  return out;
}

export function buildPrintHtml(opts: PrintOptions): string {
  const topic = getTopic(opts.topicId);
  if (AUDIO_ONLY.has(topic.id)) throw new Error(`Ez a témakör nem nyomtatható: ${topic.id}`);
  const sheets = [...opts.indices].sort((a, b) => a - b).map((index) => ({ index, s: buildSheet(topic, index) }));
  let html = '';
  for (const { index, s } of sheets) {
    html += sheetPage(topic.nameHu, index, s);
    if (opts.key === 'back') html += keyBackPage(topic.nameHu, index, s);
  }
  if (opts.key === 'end') html += keyEndPages(topic.nameHu, sheets);
  return html;
}

/** Elkészíti a nyomtatható oldalakat, és megnyitja a böngésző nyomtatási ablakát. */
export function printSheets(opts: PrintOptions): void {
  document.getElementById('print-root')?.remove();
  const root = document.createElement('div');
  root.id = 'print-root';
  root.innerHTML = buildPrintHtml(opts);
  document.body.append(root);
  const cleanup = (): void => {
    window.removeEventListener('afterprint', cleanup);
    root.remove();
  };
  window.addEventListener('afterprint', cleanup);
  window.print();
}
