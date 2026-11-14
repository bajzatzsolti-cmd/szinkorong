import { describe, expect, it } from 'vitest';
import { PRINTABLE, buildPrintHtml } from '../../src/app/print';
import { range } from '../../src/engine/rng';
import { TOPICS, buildSheet } from '../../src/topics';

const count = (html: string, needle: string): number => html.split(needle).length - 1;

describe('Nyomtatás', () => {
  it('a hallás utáni témakörök nem nyomtathatók, minden más igen', () => {
    const ids = PRINTABLE.map((t) => t.id);
    for (const id of ['holvan', 'haakkor', 'hangolo']) expect(ids).not.toContain(id);
    expect(ids).toHaveLength(TOPICS.length - 3);
    expect(() => buildPrintHtml({ topicId: 'holvan', indices: [0], key: 'none' })).toThrow();
  });

  for (const topic of PRINTABLE) {
    it(`${topic.nameHu}: 15 lap, laponként annyi üres kör, ahány feladat; a kulcs minden lap után`, () => {
      const html = buildPrintHtml({ topicId: topic.id, indices: range(15), key: 'back' });
      expect(count(html, '<section class="pp"')).toBe(15);
      expect(count(html, '<section class="pp pp-keypage"')).toBe(15);
      const total = range(15).reduce((s, i) => s + buildSheet(topic, i).spec.n, 0);
      expect(count(html, 'class="pp-circle"')).toBe(total);
      expect(count(html, 'pkey"')).toBe(total);
    });
  }

  it('kulcs a végén: laponként egy színsor, legfeljebb 15 sor egy oldalon', () => {
    const html = buildPrintHtml({ topicId: 'arnyek', indices: range(15), key: 'end' });
    expect(count(html, '<section class="pp pp-keyend"')).toBe(1);
    expect(count(html, 'class="pp-keyrow"')).toBe(15);
  });

  it('a Kódfejtő lapján a jelkulcs is rajta van', () => {
    const html = buildPrintHtml({ topicId: 'kodfejto', indices: [0], key: 'none' });
    expect(html).toContain('pp-sheethead');
  });
});
