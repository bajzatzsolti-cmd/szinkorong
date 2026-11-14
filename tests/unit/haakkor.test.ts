import { describe, expect, it } from 'vitest';
import { WORD_BY_ID, isPictureSafe } from '../../src/data/vocab';
import { range } from '../../src/engine/rng';
import type { Visual } from '../../src/render/visual';
import { buildSheet } from '../../src/topics';
import { haakkor } from '../../src/topics/haakkor';
import { ITEMS, ITEM_BY_ID } from '../../src/topics/haakkor/data';
import { verify } from '../../src/topics/haakkor/verify';
import { clone, topicSuite } from './topic-suite';

topicSuite(haakkor);

describe('Ha–akkor – tartalom', () => {
  it('szintenként 15 feladat, mindegyik megoldása használható kép; az azonosítók egyediek', () => {
    for (const lvl of [1, 2, 3]) expect(ITEMS.filter((i) => i.szint === lvl)).toHaveLength(15);
    expect(new Set(ITEMS.map((i) => i.id)).size).toBe(ITEMS.length);
    for (const i of ITEMS) {
      const w = WORD_BY_ID.get(i.valasz);
      expect(w && isPictureSafe(w), i.id).toBe(true);
      for (const u of i.utkozik) expect(WORD_BY_ID.has(u), `${i.id}: ${u}`).toBe(true);
    }
  });

  it('csak érvényes alakok: az 1–2. szint „Ha …” feltétellel kezdődik, a 3. szint „vagy … vagy” + tagadás', () => {
    for (const i of ITEMS) {
      if (i.szint < 3) expect(i.szoveg, i.id).toMatch(/^Ha /);
      else {
        expect(i.szoveg, i.id).toMatch(/vagy .+, vagy /i);
        expect(i.szoveg, i.id).toMatch(/\bnem\b/);
      }
      expect(i.szoveg.trim().endsWith('?'), i.id).toBe(true);
    }
  });

  it('a lapon soha nincs ütköző kép (ami a hétköznapi tapasztalat szerint szintén illene)', () => {
    for (const index of range(15)) {
      const s = buildSheet(haakkor, index);
      const answers = s.answers.map((a) => (a.visual as Extract<Visual, { t: 'img' }>).id);
      for (const t of s.tasks) {
        const item = ITEM_BY_ID.get(t.say!.slice('haakkor-'.length))!;
        for (const a of answers) expect(item.utkozik, `${index + 1}. lap, ${item.id}`).not.toContain(a);
      }
    }
  });
});

describe('Ha–akkor – a verifikátor elkapja a hibákat', () => {
  it('ütköző kép kerül a lapra (pl. a sapka mellé a sál)', () => {
    const s = clone(buildSheet(haakkor, 0));
    const t = s.tasks.find((x) => ITEM_BY_ID.get(x.say!.slice('haakkor-'.length))!.utkozik.length > 0);
    if (!t) return;
    const item = ITEM_BY_ID.get(t.say!.slice('haakkor-'.length))!;
    const other = s.answers.find((a) => a.disc !== t.disc)!;
    (other.visual as Extract<Visual, { t: 'img' }>).id = item.utkozik[0]!;
    expect(verify(s).length).toBeGreaterThan(0);
  });

  it('más szintű feladat a lapon', () => {
    const s = clone(buildSheet(haakkor, 0));
    const l3 = ITEMS.find((i) => i.szint === 3)!;
    s.tasks[0]!.say = `haakkor-${l3.id}`;
    expect(verify(s).length).toBeGreaterThan(0);
  });
});
