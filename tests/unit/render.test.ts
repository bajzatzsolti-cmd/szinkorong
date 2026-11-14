import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { range } from '../../src/engine/rng';
import { SHEETS_PER_TOPIC } from '../../src/engine/sheet';
import { collectImages, renderVisual, visualKey, type Visual } from '../../src/render/visual';
import { TOPICS, buildDemo, buildSheet } from '../../src/topics';

const sprite = readFileSync('src/assets/sprite/openmoji.svg', 'utf8');

/** Minden témakör minden lapjának (és bemutatójának) minden feladata és megoldása. */
function allVisuals(): { where: string; v: Visual }[] {
  const out: { where: string; v: Visual }[] = [];
  for (const topic of TOPICS) {
    out.push({ where: `${topic.id} ikon`, v: topic.icon });
    const sheets = range(SHEETS_PER_TOPIC).map((i) => ({ name: `${i + 1}. lap`, sheet: buildSheet(topic, i) }));
    if (topic.demoSize) sheets.push({ name: 'bemutató', sheet: buildDemo(topic) });
    for (const { name, sheet } of sheets) {
      sheet.tasks.forEach((t, i) => out.push({ where: `${topic.id} ${name}, ${i + 1}. feladat`, v: t.visual }));
      sheet.answers.forEach((a, i) => out.push({ where: `${topic.id} ${name}, ${i + 1}. megoldás`, v: a.visual }));
    }
  }
  return out;
}

describe('rajzolás: minden témakör minden lapja', () => {
  const visuals = allVisuals();

  it('minden elem kirajzolható, hibás szám (NaN) vagy hiányzó érték nélkül', () => {
    expect(visuals.length).toBeGreaterThan(1500);
    for (const { where, v } of visuals) {
      const svg = renderVisual(v);
      expect(svg.startsWith('<svg'), where).toBe(true);
      expect(/NaN|undefined|Infinity/.test(svg), `${where}: ${svg.slice(0, 200)}`).toBe(false);
      const vb = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(svg);
      expect(vb && Number(vb[1]) > 0 && Number(vb[2]) > 0, where).toBe(true);
    }
  });

  it('nincs hiányzó kép: minden hivatkozott szókincs-kép és árnyék megvan a sprite-ban', () => {
    for (const { where, v } of visuals) {
      for (const img of collectImages(v)) {
        const id = `${img.shadow ? 's' : 'w'}-${img.id}`;
        expect(sprite.includes(`id="${id}"`), `${where}: hiányzik a(z) ${id}`).toBe(true);
      }
    }
  });

  it('a kulcs (visualKey) minden elemre kiszámolható és stabil', () => {
    for (const { v } of visuals.slice(0, 400)) expect(visualKey(v)).toBe(visualKey(JSON.parse(JSON.stringify(v)) as Visual));
  });
});

describe('rajzolás: az új elemtípusok', () => {
  it('betű keretben és anélkül; két betű kisebb mérettel', () => {
    expect(renderVisual({ t: 'glyph', ch: 'Á', boxed: true })).toContain('vgbox');
    expect(renderVisual({ t: 'glyph', ch: 'Á' })).not.toContain('vgbox');
    expect(renderVisual({ t: 'glyph', ch: 'Aa' })).toContain('font-size="52"');
  });

  it('tízes keret: k telt és 10 − k üres pötty', () => {
    const svg = renderVisual({ t: 'dots', k: 7 });
    expect(svg.match(/vdot-on/g)).toHaveLength(7);
    expect(svg.match(/vdot-off/g)).toHaveLength(3);
  });

  it('rács: annyi cella, ahány elem; a keretes rácsban cellakeretek', () => {
    const items: Visual[] = range(4).map(() => ({ t: 'shape', id: 'kor', fill: 'solid' }));
    const svg = renderVisual({ t: 'grid', cols: 2, frame: true, items });
    expect(svg.match(/class="vcell"/g)).toHaveLength(4);
    expect(svg).toContain('viewBox="0 0 200 200"');
  });

  it('fél kép: beágyazott, félszélességű nézet és vágásvonal', () => {
    const svg = renderVisual({ t: 'img', id: 'alma', half: true });
    expect(svg).toContain('width="50" height="100" viewBox="0 0 50 100"');
    expect(svg).toContain('vcut');
  });

  it('a sorozat a különböző magasságú elemeket függőlegesen középre igazítja', () => {
    const svg = renderVisual({ t: 'seq', items: [{ t: 'glyph', ch: 'A' }, { t: 'grid', cols: 1, cell: 50, items: [{ t: 'glyph', ch: 'B' }] }] });
    expect(svg).toContain('translate(108 25)');
  });

  it('darabszám-csomag: 1–4 elem, többre hibát dob', () => {
    const one: Visual = { t: 'shape', id: 'kor', fill: 'solid' };
    expect(() => renderVisual({ t: 'pack', items: [one, one, one] })).not.toThrow();
    expect(() => renderVisual({ t: 'pack', items: [one, one, one, one, one] })).toThrow();
  });
});
