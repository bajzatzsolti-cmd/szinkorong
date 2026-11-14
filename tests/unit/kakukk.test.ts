import { describe, expect, it } from 'vitest';
import { CATEGORIES, WORD_BY_ID } from '../../src/data/vocab';
import { range } from '../../src/engine/rng';
import type { Sheet } from '../../src/engine/sheet';
import { visualKey, type Visual } from '../../src/render/visual';
import { buildSheet } from '../../src/topics';
import { kakukk } from '../../src/topics/kakukk';
import { EASY_CATEGORIES, colourOdd } from '../../src/topics/kakukk/generate';
import { verify } from '../../src/topics/kakukk/verify';
import { clone, topicSuite } from './topic-suite';

topicSuite(kakukk);

type Seq = Extract<Visual, { t: 'seq' }>;
const items = (v: Visual): Visual[] => (v as Seq).items;

describe('Kakukktojás – szabályok', () => {
  it('colourOdd: csak a 3 : 1 színeloszlásnál ad eredményt', () => {
    expect(colourOdd(['piros', 'piros', 'piros', 'zöld'])).toBe(3);
    expect(colourOdd(['kék', 'piros', 'kék', 'kék'])).toBe(1);
    expect(colourOdd(['piros', 'piros', 'zöld', 'zöld'])).toBeNull();
    expect(colourOdd(['piros', 'piros', 'piros', 'piros'])).toBeNull();
    expect(colourOdd(['piros', 'kék', 'zöld', 'sárga'])).toBeNull();
  });

  it('1–2. szint: négy különböző kép, három egy családból; 1. szinten csak a könnyű csoportok', () => {
    for (const index of range(10)) {
      for (const t of buildSheet(kakukk, index).tasks) {
        const ws = items(t.visual).map((v) => WORD_BY_ID.get((v as Extract<Visual, { t: 'img' }>).id)!);
        expect(new Set(ws.map((w) => w.id)).size).toBe(4);
        const fams = ws.map((w) => CATEGORIES[w.category]!.family);
        const counts = [...new Set(fams)].map((f) => fams.filter((x) => x === f).length).sort();
        expect(counts).toEqual([1, 3]);
        if (index < 5) for (const w of ws) expect(EASY_CATEGORIES).toContain(w.category);
      }
    }
  });

  it('3. szint: három egyforma és egy eltérő; mindhárom tulajdonság (irány, darabszám, szín) előfordul', () => {
    const kinds = new Set<string>();
    for (const index of range(5).map((i) => i + 10)) {
      for (const t of buildSheet(kakukk, index).tasks) {
        const keys = items(t.visual).map(visualKey);
        const counts = [...new Set(keys)].map((k) => keys.filter((x) => x === k).length).sort();
        expect(counts).toEqual([1, 3]);
        const odd = items(t.visual)[keys.findIndex((k) => keys.filter((x) => x === k).length === 1)]!;
        const base = items(t.visual)[keys.findIndex((k) => keys.filter((x) => x === k).length === 3)]!;
        if (odd.t === 'pack' || base.t === 'pack') kinds.add('count');
        else if (odd.t === 'shape') kinds.add('tint');
        else kinds.add('flip');
      }
    }
    expect([...kinds].sort()).toEqual(['count', 'flip', 'tint']);
  });

  it('minden megoldás-kép két csoportban is szerepel (egyszer kakukktojás, egyszer a többiek között)', () => {
    for (const index of range(15)) {
      const sheet = buildSheet(kakukk, index);
      for (const a of sheet.answers) {
        const k = visualKey(a.visual);
        const inTasks = sheet.tasks.filter((t) => items(t.visual).some((v) => visualKey(v) === k)).length;
        expect(inTasks).toBe(2);
      }
    }
  });
});

describe('Kakukktojás – a verifikátor elkapja a hibákat', () => {
  const base = (index: number): Sheet => clone(buildSheet(kakukk, index));

  it('két kép egy másik családból (nincs egyértelmű kakukktojás)', () => {
    const s = base(0);
    const its = items(s.tasks[0]!.visual);
    const ws = its.map((v) => WORD_BY_ID.get((v as Extract<Visual, { t: 'img' }>).id)!);
    const fams = ws.map((w) => CATEGORIES[w.category]!.family);
    const oddIdx = fams.findIndex((f) => fams.filter((x) => x === f).length === 1);
    const regIdx = fams.findIndex((_, i) => i !== oddIdx);
    its[regIdx] = { t: 'img', id: ws[oddIdx]!.category === 'gy' ? 'korte' : 'csillag' };
    expect(verify(s).length).toBeGreaterThan(0);
  });

  it('színe szerint egy másik kép lógna ki', () => {
    // három piros (alma, cseresznye, eper – gyümölcs) és egy autó (piros) helyett: három különböző színű gyümölcs + piros jármű
    const s = base(0);
    const t = s.tasks[0]!;
    (t.visual as Seq).items = [
      { t: 'img', id: 'alma' },
      { t: 'img', id: 'eper' },
      { t: 'img', id: 'banan' },
      { t: 'img', id: 'auto' },
    ];
    const problems = verify(s);
    const colours = ['alma', 'eper', 'banan', 'auto'].map((id) => WORD_BY_ID.get(id)!.color);
    if (colourOdd(colours) !== null && colourOdd(colours) !== 3) expect(problems.some((p) => p.includes('színe'))).toBe(true);
    else expect(problems.length).toBeGreaterThan(0); // legalább a megoldás-hozzárendelés elromlik
  });

  it('kerülőút: a csoportban csak egy megoldás-kép van', () => {
    const s = base(0);
    const t = s.tasks[0]!;
    const answerKeys = new Set(s.answers.map((a) => visualKey(a.visual)));
    const own = visualKey(s.answers.find((a) => a.disc === t.disc)!.visual);
    const its = items(t.visual);
    const ws = its.map((v) => WORD_BY_ID.get((v as Extract<Visual, { t: 'img' }>).id)!);
    its.forEach((v, i) => {
      const k = visualKey(v);
      if (answerKeys.has(k) && k !== own) {
        const repl = [...WORD_BY_ID.values()].find((w) => w.category === ws[i]!.category && !ws.some((x) => x.id === w.id) && !answerKeys.has(visualKey({ t: 'img', id: w.id })));
        its[i] = { t: 'img', id: repl!.id };
      }
    });
    expect(verify(s).some((p) => p.includes('kerülőút'))).toBe(true);
  });

  it('3. szinten két tulajdonságban eltérő elem', () => {
    const s = base(12);
    const its = items(s.tasks[0]!.visual);
    const keys = its.map(visualKey);
    const oddIdx = keys.findIndex((k) => keys.filter((x) => x === k).length === 1);
    const odd = its[oddIdx]!;
    if (odd.t === 'shape') its[oddIdx] = { ...odd, id: odd.id === 'kor' ? 'negyzet' : 'kor' };
    else if (odd.t === 'img') its[oddIdx] = { ...odd, rot: 90 };
    else if (odd.t === 'pack') its[oddIdx] = { t: 'pack', items: [{ t: 'img', id: 'alma' }, { t: 'img', id: 'alma' }, { t: 'img', id: 'alma' }] };
    expect(verify(s).length).toBeGreaterThan(0);
  });
});
