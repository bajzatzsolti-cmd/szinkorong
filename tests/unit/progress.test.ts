import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  _resetMemoryForTests,
  doneCount,
  getSettings,
  isDemoSeen,
  isDone,
  markDemoSeen,
  markDone,
  nextUndone,
  resetProgress,
  updateSettings,
} from '../../src/engine/progress';

function fakeStorage(initial: Record<string, string> = {}) {
  const data = { ...initial };
  return {
    data,
    getItem: (k: string) => (k in data ? data[k]! : null),
    setItem: (k: string, v: string) => void (data[k] = v),
    removeItem: (k: string) => void delete data[k],
  };
}

beforeEach(() => _resetMemoryForTests());
afterEach(() => vi.unstubAllGlobals());

describe('haladás', () => {
  it('üres tárolóval hibátlanul indul', () => {
    vi.stubGlobal('localStorage', fakeStorage());
    expect(isDone('minta', 0)).toBe(false);
    expect(doneCount('minta')).toBe(0);
    expect(getSettings().volume).toBeGreaterThan(0);
  });

  it('tároló nélkül (nincs localStorage) is működik', () => {
    vi.stubGlobal('localStorage', undefined);
    markDone('minta', 2, 1);
    expect(isDone('minta', 2)).toBe(true);
  });

  it('dobó tárolóval (privát mód) is működik', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('tiltva');
      },
      setItem: () => {
        throw new Error('tiltva');
      },
    });
    markDone('minta', 0, 2);
    expect(isDone('minta', 0)).toBe(true);
  });

  it('sérült tárolt tartalommal üresen indul', () => {
    vi.stubGlobal('localStorage', fakeStorage({ 'szinkorong:v1': '{nem json' }));
    expect(doneCount('minta')).toBe(0);
  });

  it('elmenti és visszatölti a készre jelölést', () => {
    const st = fakeStorage();
    vi.stubGlobal('localStorage', st);
    markDone('minta', 4, 3);
    _resetMemoryForTests();
    expect(isDone('minta', 4)).toBe(true);
    expect(isDone('minta', 5)).toBe(false);
  });

  it('a legjobb (legkevesebb) próbálkozást őrzi', () => {
    const st = fakeStorage();
    vi.stubGlobal('localStorage', st);
    markDone('minta', 1, 3);
    markDone('minta', 1, 1);
    markDone('minta', 1, 2);
    const saved = JSON.parse(st.data['szinkorong:v1']!) as { done: Record<string, { tries: number }> };
    expect(saved.done['minta:1']!.tries).toBe(1);
  });

  it('nextUndone: az első még nem kész lap', () => {
    vi.stubGlobal('localStorage', fakeStorage());
    expect(nextUndone('minta', 15)).toBe(0);
    markDone('minta', 0, 1);
    markDone('minta', 1, 1);
    expect(nextUndone('minta', 15)).toBe(2);
  });

  it('törlés', () => {
    vi.stubGlobal('localStorage', fakeStorage());
    markDone('minta', 0, 1);
    resetProgress();
    expect(doneCount('minta')).toBe(0);
  });

  it('bemutató: a „már látta” jelölés megmarad, a haladás törlése ezt is törli', () => {
    const st = fakeStorage();
    vi.stubGlobal('localStorage', st);
    expect(isDemoSeen('matrix')).toBe(false);
    markDemoSeen('matrix');
    markDemoSeen('matrix');
    _resetMemoryForTests();
    expect(isDemoSeen('matrix')).toBe(true);
    expect(isDemoSeen('analogia')).toBe(false);
    expect((JSON.parse(st.data['szinkorong:v1']!) as { demos: string[] }).demos).toEqual(['matrix']);
    resetProgress();
    expect(isDemoSeen('matrix')).toBe(false);
  });

  it('régi (bemutató-jelölés nélküli) tárolt állapot is betölthető', () => {
    vi.stubGlobal('localStorage', fakeStorage({ 'szinkorong:v1': JSON.stringify({ v: 1, done: { 'minta:0': { at: 1, tries: 1 } }, settings: { volume: 0.5, disabled: [] } }) }));
    expect(isDone('minta', 0)).toBe(true);
    expect(isDemoSeen('matrix')).toBe(false);
  });

  it('beállítások: hangerő és kikapcsolt témakörök megmaradnak', () => {
    const st = fakeStorage();
    vi.stubGlobal('localStorage', st);
    updateSettings({ volume: 0.3, disabled: ['minta'] });
    _resetMemoryForTests();
    expect(getSettings().volume).toBe(0.3);
    expect(getSettings().disabled).toEqual(['minta']);
  });

  it('érvénytelen beállítás-értékeket eldobja', () => {
    vi.stubGlobal(
      'localStorage',
      fakeStorage({ 'szinkorong:v1': JSON.stringify({ v: 1, done: {}, settings: { volume: 7, disabled: [1, 'minta'] } }) }),
    );
    expect(getSettings().volume).toBeLessThanOrEqual(1);
    expect(getSettings().disabled).toEqual(['minta']);
  });
});
