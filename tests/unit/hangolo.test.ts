import { describe, expect, it } from 'vitest';
import { WORD_BY_ID } from '../../src/data/vocab';
import { range } from '../../src/engine/rng';
import type { Visual } from '../../src/render/visual';
import { buildSheet } from '../../src/topics';
import { hangolo } from '../../src/topics/hangolo';
import { planFor } from '../../src/topics/hangolo/generate';
import { confusable, fitsRule, shortcut, soundOf } from '../../src/topics/hangolo/rules';
import { verify } from '../../src/topics/hangolo/verify';
import { clone, topicSuite } from './topic-suite';

topicSuite(hangolo);

const w = (id: string) => WORD_BY_ID.get(id)!;
type Seq = Extract<Visual, { t: 'seq' }>;
const ruleOf = (v: Visual): string => ((v as Seq).items[1] as Extract<Visual, { t: 'sym' }>).id;

describe('Hangoló plusz – hangtani szabályok', () => {
  it('a kétjegyű betű egy hang; az ly ugyanaz, mint a j', () => {
    expect(soundOf(w('csiga'), 'kezdo')).toBe('cs');
    expect(confusable('ly', 'j')).toBe(true);
  });

  it('a zöngés–zöngétlen pár összetéveszthető, a rövid–hosszú magánhangzó nem', () => {
    expect(confusable('b', 'p')).toBe(true);
    expect(confusable('sz', 'z')).toBe(true);
    expect(confusable('gy', 'ty')).toBe(true);
    expect(confusable('a', 'á')).toBe(false);
    expect(confusable('k', 'h')).toBe(false);
  });

  it('nem egyértelmű nevű vagy ellenőrzésre váró szó nem kerül Hangoló-feladatba', () => {
    for (const word of WORD_BY_ID.values()) {
      if (!word.clearName || word.flags.length > 0) {
        expect(fitsRule(word, 'kezdo') || fitsRule(word, 'veg') || fitsRule(word, 'szotag')).toBe(false);
      }
    }
  });

  it('kerülőút: azonos csoport (pl. két állat) nem lehet feladat–megoldás pár', () => {
    expect(shortcut(w('kutya'), w('cica'))).toBe(true);
  });

  it('szintbeosztás: 1. kezdőhang, 2. végső hang, 3. vegyes (4 szótagszám)', () => {
    expect(planFor(0, 6)).toEqual({ kezdo: 6, veg: 0, szotag: 0 });
    expect(planFor(1, 8)).toEqual({ kezdo: 0, veg: 8, szotag: 0 });
    expect(planFor(2, 10)).toEqual({ kezdo: 3, veg: 3, szotag: 4 });
    for (const index of range(15)) {
      const rules = buildSheet(hangolo, index).tasks.map((t) => ruleOf(t.visual));
      if (index < 5) expect(new Set(rules)).toEqual(new Set(['snd-start']));
      else if (index < 10) expect(new Set(rules)).toEqual(new Set(['snd-end']));
      else expect(rules.filter((r) => r === 'syl')).toHaveLength(4);
    }
  });

  it('minden feladat hangja: kérdéssablon + a kép neve', () => {
    for (const index of [0, 6, 12]) {
      for (const t of buildSheet(hangolo, index).tasks) expect(t.say).toMatch(/^hangolo-(kezdo|veg|szotag)\+szo-/);
    }
  });
});

describe('Hangoló plusz – a verifikátor elkapja a hangtani hibákat', () => {
  it('ha egy megoldást egy zöngés párjára cserélünk (pl. b helyett p), két megoldás illik vagy egy sem', () => {
    const s = clone(buildSheet(hangolo, 0));
    // Egy olyan szó, amelyik a lapon lévő egyik megoldás kezdőhangjának zöngés párjával kezdődik.
    const target = s.answers.findIndex((a) => {
      if (a.visual.t !== 'img') return false;
      const sound = soundOf(w(a.visual.id), 'kezdo');
      return ['b', 'p', 'd', 't', 'g', 'k', 'v', 'f', 'z', 'sz', 's', 'zs'].includes(sound);
    });
    if (target < 0) return; // ezen a lapon nincs zöngés párú hang
    const a = s.answers[target]!.visual as Extract<Visual, { t: 'img' }>;
    const sound = soundOf(w(a.id), 'kezdo');
    const partner = { b: 'p', p: 'b', d: 't', t: 'd', g: 'k', k: 'g', v: 'f', f: 'v', z: 'sz', sz: 'z', s: 'zs', zs: 's' }[sound]!;
    const repl = [...WORD_BY_ID.values()].find(
      (x) => fitsRule(x, 'kezdo') && soundOf(x, 'kezdo') === partner && !JSON.stringify(s).includes(`"${x.id}"`),
    );
    if (!repl) return;
    a.id = repl.id;
    expect(verify(s).length).toBeGreaterThan(0);
  });

  it('a 3. szinten a szótagszám-megoldás eltávolítása hibát ad', () => {
    const s = clone(buildSheet(hangolo, 12));
    const dots = s.answers.findIndex((a) => a.visual.t === 'dots');
    (s.answers[dots]!.visual as Extract<Visual, { t: 'dots' }>).k = 5;
    expect(verify(s).length).toBeGreaterThan(0);
  });

  it('az 1. szinten végsőhang-jel nem lehet', () => {
    const s = clone(buildSheet(hangolo, 1));
    ((s.tasks[0]!.visual as Seq).items[1] as Extract<Visual, { t: 'sym' }>).id = 'snd-end';
    expect(verify(s).length).toBeGreaterThan(0);
  });
});
