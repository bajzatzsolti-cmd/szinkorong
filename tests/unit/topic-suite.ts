// Közös tesztkészlet minden témakörhöz: mind a 15 lap, determinizmus, sok véletlen mag, és hogy a
// verifikátor valóban elkapja a hibákat. Új témakörnél csak meg kell hívni: topicSuite(topic).
import { describe, expect, it } from 'vitest';
import { range } from '../../src/engine/rng';
import { SHEETS_PER_TOPIC, levelOf, type Sheet, type SheetSpec } from '../../src/engine/sheet';
import { buildSheet } from '../../src/topics';
import type { Topic } from '../../src/topics/types';

export const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x)) as T;

export function topicSuite(topic: Topic, extra?: { seeds?: number }): void {
  const seeds = extra?.seeds ?? 300;

  describe(`${topic.nameHu} – mind a 15 lap`, () => {
    for (const index of range(SHEETS_PER_TOPIC)) {
      it(`${index + 1}. lap: elemszám, különböző megoldások, egyértelműség`, () => {
        const sheet = buildSheet(topic, index);
        expect(sheet.tasks).toHaveLength(topic.sizes[levelOf(index)]!);
        expect(sheet.answers).toHaveLength(sheet.spec.n);
        expect(topic.verify(sheet)).toEqual([]);
      });
    }

    it('determinisztikus: ugyanaz a lap mindig ugyanaz', () => {
      for (const index of [0, 7, 14]) {
        expect(buildSheet(topic, index)).toEqual(buildSheet(topic, index));
      }
    });

    it('a 15 lap páronként különbözik', () => {
      const keys = range(SHEETS_PER_TOPIC).map((i) => JSON.stringify(buildSheet(topic, i)));
      expect(new Set(keys).size).toBe(SHEETS_PER_TOPIC);
    });

    it('minden feladathoz és megoldáshoz van hang-azonosító vagy nincs, de ha van, a manifestben szerepel', async () => {
      const manifest = (await import('../../content/audio/manifest.json')).default as Record<string, string>;
      for (const index of range(SHEETS_PER_TOPIC)) {
        const sheet = buildSheet(topic, index);
        for (const c of [...sheet.tasks, ...sheet.answers]) {
          // Egy hanganyag több klip sora is lehet ("sablon+szo-macska"): mindegyik része kell.
          for (const part of c.say?.split('+') ?? []) expect(manifest[part], `${part} hiányzik a manifestből`).toBeTruthy();
        }
        expect(manifest[topic.instructionId(sheet.spec.level)]).toBeTruthy();
      }
    });
  });

  describe(`${topic.nameHu} – a generátor sok véletlen maggal is hibátlan`, () => {
    for (const level of [0, 1, 2]) {
      it(`${level + 1}. szint, ${seeds} különböző mag`, () => {
        const n = topic.sizes[level]!;
        for (let seed = 1; seed <= seeds; seed++) {
          const spec: SheetSpec = { topic: topic.id, level, index: level * 5, n, seed: seed * 7919 };
          const problems = topic.verify(topic.generate(spec));
          expect(problems, `mag: ${spec.seed}`).toEqual([]);
        }
      });
    }
  });

  describe(`${topic.nameHu} – a verifikátor elkapja a hibákat`, () => {
    const base = (): Sheet => clone(buildSheet(topic, 3));

    it('két egyforma megoldás', () => {
      const s = base();
      s.answers[1]!.visual = clone(s.answers[0]!.visual);
      expect(topic.verify(s).length).toBeGreaterThan(0);
    });

    it('felcserélt korongok (a megoldás más feladathoz van rendelve)', () => {
      const s = base();
      const d = s.answers[0]!.disc;
      s.answers[0]!.disc = s.answers[1]!.disc;
      s.answers[1]!.disc = d;
      expect(topic.verify(s).length).toBeGreaterThan(0);
    });

    it('hiányzó megoldás', () => {
      const s = base();
      s.answers.pop();
      expect(topic.verify(s).length).toBeGreaterThan(0);
    });
  });
}
