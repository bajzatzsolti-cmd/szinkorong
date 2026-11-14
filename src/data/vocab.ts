// A központi szókincs betöltése. A szerkeszthető forrás: content/szokincs.json és content/kategoriak.json.
// A hangtani adatok (hangok, kezdő/végső hang, szótagszám) a magyar névből készülnek (phonetics.ts),
// a forrásban felülírhatók.
import categoriesRaw from '../../content/kategoriak.json' with { type: 'json' };
import vocabRaw from '../../content/szokincs.json' with { type: 'json' };
import { derive } from './phonetics';

export interface WordSource {
  id: string;
  hu: string;
  category: string;
  /** Az OpenMoji emoji-ja (innen készül az SVG-kép). */
  emoji: string;
  goodShadow?: boolean;
  clearName?: boolean;
  similar?: string;
  twin?: string;
  flags?: string[];
  note?: string;
  /** Felülírások a hangtani adatokra. */
  syllables?: number;
  phon?: string[];
  rhymeGroup?: string;
  tags?: string[];
}

export interface Word {
  id: string;
  hu: string;
  category: string;
  emoji: string;
  goodShadow: boolean;
  /** A kép neve egy ötévesnek egyértelmű. */
  clearName: boolean;
  /** Hasonló alakú árnyékok csoportja (nehéz Árnyékvadász lapokhoz). */
  similar?: string;
  /** Szinte egyforma képek csoportja: nem lehetnek egy lapon. */
  twin?: string;
  /** Minden jelzés: a hangtani (automatikus) és a kézzel írt (authoredFlags) együtt. */
  flags: string[];
  /** Csak a kézzel írt jelzések (kép, besorolás bizonytalansága): ezek kizárják a szót a képes feladatokból. */
  authoredFlags: string[];
  note?: string;
  phon: string[];
  startSound: string;
  endSound: string;
  syllables: number;
  rhymeGroup?: string;
  tags: string[];
}

export interface Category {
  id: string;
  name: string;
  /** Ugyanabba a családba tartozó kategóriák nem szerepelhetnek egy lapon. */
  family: string;
  groupable: boolean;
}

export function buildWord(src: WordSource): Word {
  const d = derive(src.hu);
  const phon = src.phon ?? d.phon;
  return {
    id: src.id,
    hu: src.hu,
    category: src.category,
    emoji: src.emoji,
    goodShadow: src.goodShadow ?? false,
    clearName: src.clearName ?? true,
    similar: src.similar,
    twin: src.twin,
    flags: [...d.flags, ...(src.flags ?? [])],
    authoredFlags: src.flags ?? [],
    note: src.note,
    phon,
    startSound: phon[0] as string,
    endSound: phon[phon.length - 1] as string,
    syllables: src.syllables ?? d.syllables,
    rhymeGroup: src.rhymeGroup,
    tags: src.tags ?? [],
  };
}

export const CATEGORIES: Readonly<Record<string, Category>> = Object.fromEntries(
  Object.entries(categoriesRaw as unknown as Record<string, { name: string; family?: string; groupable: boolean }>)
    .filter(([id]) => !id.startsWith('_'))
    .map(([id, c]) => [id, { id, name: c.name, family: c.family ?? id, groupable: c.groupable }]),
);

export const WORDS: readonly Word[] = (vocabRaw as { words: WordSource[] }).words.map(buildWord);

export const WORD_BY_ID: ReadonlyMap<string, Word> = new Map(WORDS.map((w) => [w.id, w]));

export function getWord(id: string): Word {
  const w = WORD_BY_ID.get(id);
  if (!w) throw new Error(`Ismeretlen szó: ${id}`);
  return w;
}

export const wordsOfCategory = (category: string): Word[] => WORDS.filter((w) => w.category === category);

/** Az a szó, amelynek az ellenőrizni való adata van (a szülő jóváhagyására vár). */
export const hasOpenFlag = (w: Word): boolean => w.flags.length > 0;

/**
 * Képes feladatokban (árnyék, párok, csoportok, minták) csak olyan szót használunk, amelyiknek a képpel
 * vagy a besorolással kapcsolatos adata nem vár ellenőrzésre (nincs kézzel írt [ELLENŐRIZNI] jelzése).
 * A hangtani bizonytalanság (szótagszám, ly, dz) itt nem számít: az csak a Hangoló plusz témakört érinti.
 */
export const isPictureSafe = (w: Word): boolean => w.authoredFlags.length === 0;
