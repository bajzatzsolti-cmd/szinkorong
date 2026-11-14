import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { derive, tokenize } from '../../src/data/phonetics';
import { CATEGORIES, WORDS, isPictureSafe } from '../../src/data/vocab';
import manifest from '../../content/audio/manifest.json';

const sprite = readFileSync('src/assets/sprite/openmoji.svg', 'utf8');

describe('szókincs (content/szokincs.json)', () => {
  it('az azonosítók egyediek és ékezet nélküli kisbetűk', () => {
    const ids = WORDS.map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z]+$/);
  });

  it('minden szó kategóriája létezik, a magyar neve és az emoji-ja nem üres', () => {
    for (const w of WORDS) {
      expect(CATEGORIES[w.category], `${w.id}: ismeretlen kategória ${w.category}`).toBeTruthy();
      expect(w.hu.length).toBeGreaterThan(0);
      expect(w.emoji.length).toBeGreaterThan(0);
    }
  });

  it('minden szónak van színes képe a sprite-ban, és árnyéka pontosan akkor, ha goodShadow', () => {
    for (const w of WORDS) {
      expect(sprite.includes(`id="w-${w.id}"`), `${w.id}: nincs színes kép (futtasd: npm run sprite)`).toBe(true);
      expect(sprite.includes(`id="s-${w.id}"`), `${w.id}: árnyék-eltérés (futtasd: npm run sprite)`).toBe(w.goodShadow);
    }
  });

  it('minden szó szerepel a hang-manifestben (npm run manifest)', () => {
    for (const w of WORDS) expect((manifest as Record<string, string>)[`szo-${w.id}`], w.id).toBe(w.hu);
  });

  it('a csoportosítható kategóriákban legalább 4 felhasználható szó van', () => {
    for (const c of Object.values(CATEGORIES)) {
      if (!c.groupable) continue;
      const n = WORDS.filter((w) => w.category === c.id && isPictureSafe(w)).length;
      expect(n, `${c.id} (${c.name})`).toBeGreaterThanOrEqual(4);
    }
  });

  it('legalább 12 csoportosítható kategória van (a nehéz Csoportosító laphoz kell)', () => {
    expect(Object.values(CATEGORIES).filter((c) => c.groupable).length).toBeGreaterThanOrEqual(12);
  });

  it('legalább 40 jó árnyékú, felhasználható szó van', () => {
    expect(WORDS.filter((w) => w.goodShadow && isPictureSafe(w)).length).toBeGreaterThanOrEqual(40);
  });

  it('a hangtani adatok kitöltöttek: legalább 1 szótag, kezdő- és végső hang', () => {
    for (const w of WORDS) {
      expect(w.syllables, w.id).toBeGreaterThanOrEqual(1);
      expect(w.startSound, w.id).toBeTruthy();
      expect(w.endSound, w.id).toBeTruthy();
    }
  });
});

describe('magyar hangtan (src/data/phonetics.ts)', () => {
  it('a kétjegyű betűk egy hangnak számítanak', () => {
    expect(tokenize('csiga')).toEqual(['cs', 'i', 'g', 'a']);
    expect(tokenize('nyuszi')).toEqual(['ny', 'u', 'sz', 'i']);
    expect(tokenize('zsiráf')).toEqual(['zs', 'i', 'r', 'á', 'f']);
    expect(tokenize('gyertya')).toEqual(['gy', 'e', 'r', 'ty', 'a']);
    expect(tokenize('szék')).toEqual(['sz', 'é', 'k']);
  });

  it('a háromjegyű dzs egy hang', () => {
    expect(tokenize('dzsungel')).toEqual(['dzs', 'u', 'n', 'g', 'e', 'l']);
  });

  it('a kettőzött betűvel írt hosszú mássalhangzó két egyforma hang (nny, tty, ssz)', () => {
    expect(tokenize('dinnye')).toEqual(['d', 'i', 'ny', 'ny', 'e']);
    expect(tokenize('hattyú')).toEqual(['h', 'a', 'ty', 'ty', 'ú']);
    expect(tokenize('vessző')).toEqual(['v', 'e', 'sz', 'sz', 'ő']);
  });

  it('kezdő- és végső hang, szótagszám', () => {
    const csoki = derive('csoki');
    expect([csoki.startSound, csoki.endSound, csoki.syllables]).toEqual(['cs', 'i', 2]);
    expect(derive('elefánt').syllables).toBe(3);
    expect(derive('krokodil').syllables).toBe(3);
    expect(derive('tűzoltóautó').syllables).toBe(6);
    expect(derive('ló').syllables).toBe(1);
  });

  it('bizonytalan nyelvi adatot [ELLENŐRIZNI] jelzéssel látja el', () => {
    expect(derive('autó').flags.some((f) => f.includes('[ELLENŐRIZNI]'))).toBe(true); // au: egy vagy két szótag?
    expect(derive('alma').flags).toEqual([]);
    expect(derive('lyuk').flags.some((f) => f.includes('ly'))).toBe(true); // az ly hangja j
    expect(derive('gombolyag').flags).toEqual([]); // az ly a szó közepén nem számít
  });
});
