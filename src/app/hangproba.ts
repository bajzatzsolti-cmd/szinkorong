// Hangpróba (szülői menü): minden hangszöveg egy listában, lejátszás gombbal és „rossz” jelöléssel.
// A jelölések ezen a készüléken maradnak (localStorage); a „Lista másolása” gomb a megjelölt azonosítókat
// a vágólapra teszi: ezt kell a content/audio/rossz.json-ba tenni (vagy elküldeni a fejlesztőnek), és a
// scripts/hang-generalas.mjs más beállítással újragyártja őket.
import { clipList, say, type ClipSource } from '../engine/audio';

const KEY = 'szinkorong:rossz-hangok';

function loadMarks(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function saveMarks(marks: Set<string>): void {
  try {
    localStorage.setItem(KEY, JSON.stringify([...marks].sort()));
  } catch {
    // A tároló nélkül is használható, csak nem marad meg.
  }
}

const GROUPS: [string, string][] = [
  ['utasitas-', 'Lapok utasításai'],
  ['hangolo-', 'Hangoló plusz kérdései'],
  ['szo-', 'Képek nevei'],
];
const SOURCE_LABEL: Record<ClipSource, string> = { sajat: 'saját felvétel', generalt: 'kész hangfájl', tartalek: 'gépi tartalék' };

const esc = (s: string): string => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

export function renderHangproba(card: HTMLElement, back: () => void): void {
  const marks = loadMarks();
  const clips = clipList();
  const groupOf = (id: string): string => GROUPS.find(([p]) => id.startsWith(p))?.[1] ?? 'Egyéb';
  const counts = { sajat: 0, generalt: 0, tartalek: 0 } as Record<ClipSource, number>;
  for (const c of clips) counts[c.source]++;

  const sections = [...GROUPS.map(([, name]) => name), 'Egyéb']
    .map((name) => {
      const rows = clips.filter((c) => groupOf(c.id) === name);
      if (!rows.length) return '';
      return (
        `<div class="psec">${name} (${rows.length})</div>` +
        rows
          .map(
            (c) =>
              `<div class="hrow${marks.has(c.id) ? ' bad' : ''}" data-id="${esc(c.id)}">` +
              `<button class="pbtn hplay" data-act="play" aria-label="lejátszás">▶</button>` +
              `<span class="htext">${esc(c.text)}<small>${esc(c.id)} · ${SOURCE_LABEL[c.source]}</small></span>` +
              `<label class="hbad"><input type="checkbox" data-act="mark" ${marks.has(c.id) ? 'checked' : ''}> rossz</label></div>`,
          )
          .join('')
      );
    })
    .join('');

  card.innerHTML =
    `<h2>Hangpróba</h2>` +
    `<p class="pnote">${clips.length} szöveg: ${counts.generalt} kész hangfájl, ${counts.sajat} saját felvétel, ` +
    `${counts.tartalek} egyelőre a készülék gépi hangján szól. A rossznak hallottakat jelöld meg, majd másold ki a listát.</p>` +
    `<div class="pbar"><button class="pbtn" data-act="back">Vissza</button>` +
    `<button class="pbtn primary" data-act="copy">Lista másolása (<span data-count>${marks.size}</span>)</button></div>` +
    `<textarea class="hcopy" readonly hidden></textarea>` +
    sections;

  const count = card.querySelector<HTMLElement>('[data-count]')!;
  const copyBox = card.querySelector<HTMLTextAreaElement>('.hcopy')!;

  card.onclick = (e) => {
    const t = e.target as HTMLElement;
    const act = t.closest<HTMLElement>('[data-act]')?.dataset.act;
    const row = t.closest<HTMLElement>('.hrow');
    if (act === 'back') back();
    if (act === 'play' && row) say(row.dataset.id!);
    if (act === 'copy') {
      const text = JSON.stringify([...marks].sort());
      copyBox.hidden = false;
      copyBox.value = text;
      copyBox.select();
      void navigator.clipboard?.writeText(text).catch(() => undefined);
    }
  };
  card.onchange = (e) => {
    const t = e.target as HTMLInputElement;
    const row = t.closest<HTMLElement>('.hrow');
    if (t.dataset.act !== 'mark' || !row) return;
    const id = row.dataset.id!;
    if (t.checked) marks.add(id);
    else marks.delete(id);
    row.classList.toggle('bad', t.checked);
    saveMarks(marks);
    count.textContent = String(marks.size);
  };
}
