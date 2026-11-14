import { describe, expect, it } from 'vitest';
import { range } from '../../src/engine/rng';
import type { Sheet } from '../../src/engine/sheet';
import type { Visual } from '../../src/render/visual';
import { buildSheet } from '../../src/topics';
import { kodfejto } from '../../src/topics/kodfejto';
import { KEY_SIZE, SEQ_LEN } from '../../src/topics/kodfejto/generate';
import { parseKey, verify } from '../../src/topics/kodfejto/verify';
import { clone, topicSuite } from './topic-suite';

topicSuite(kodfejto);

type Seq = Extract<Visual, { t: 'seq' }>;

describe('Kódfejtő – szabályok', () => {
  it('a kulcs 4, 5, 6 jelből áll; a sorok 2, 3, 4 hosszúak', () => {
    for (const [index, level] of [[0, 0], [6, 1], [12, 2]] as const) {
      const sheet = buildSheet(kodfejto, index);
      const key = parseKey(sheet.header);
      expect(typeof key).not.toBe('string');
      expect((key as Map<string, string>).size).toBe(KEY_SIZE[level]);
      for (const t of sheet.tasks) expect((t.visual as Seq).items).toHaveLength(SEQ_LEN[level]!);
    }
  });

  it('a kulcs képei különböző kategóriájúak (jól megkülönböztethetők)', () => {
    for (const index of range(15)) {
      const key = parseKey(buildSheet(kodfejto, index).header) as Map<string, string>;
      expect(new Set(key.values()).size).toBe(key.size);
    }
  });
});

describe('Kódfejtő – a verifikátor elkapja a hibákat', () => {
  const base = (index: number): Sheet => clone(buildSheet(kodfejto, index));

  it('egy megoldás-képsor egy képe kicserélve', () => {
    const s = base(3);
    const items = (s.answers[0]!.visual as Seq).items;
    const ids = new Set(items.map((i) => (i as { id: string }).id));
    const key = parseKey(s.header) as Map<string, string>;
    const other = [...key.values()].find((id) => !ids.has(id))!;
    items[0] = { t: 'img', id: other };
    expect(verify(s).length).toBeGreaterThan(0);
  });

  it('hiányzik a jelkulcs', () => {
    const s = base(0);
    delete s.header;
    expect(verify(s).some((p) => p.includes('jelkulcs'))).toBe(true);
  });

  it('a kulcsban egy kép kétszer szerepel', () => {
    const s = base(0);
    const items = (s.header as Seq).items.filter((i) => i.t === 'img');
    (items[1] as { id: string }).id = (items[0] as { id: string }).id;
    expect(verify(s).length).toBeGreaterThan(0);
  });
});
