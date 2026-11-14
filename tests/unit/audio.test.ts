// A hangcsomag teljessége (SPEC-2, B: „Minden a manifestben szereplő szöveghez van hangfájl, a teszt ezt ellenőrzi”).
// Ha új szöveg kerül a manifestbe, előbb le kell gyártani (npm run hang), különben ez a teszt (és a telepítés) megáll.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import manifest from '../../content/audio/manifest.json' with { type: 'json' };
import { clipKey } from '../../src/engine/clip-key';
import { hashString } from '../../src/engine/rng';

const ROOT = path.join(__dirname, '..', '..');
const AUDIO = path.join(ROOT, 'src', 'assets', 'audio');
const OWN = path.join(ROOT, 'content', 'audio', 'sajat');
const files = new Set(readdirSync(AUDIO).filter((f) => f.endsWith('.mp3')));
const own = new Set(existsSync(OWN) ? readdirSync(OWN).map((f) => f.replace(/\.(mp3|m4a)$/i, '')) : []);
const log = JSON.parse(readFileSync(path.join(AUDIO, '_lenyomatok.json'), 'utf8')) as Record<string, { generalva: string; szoveg: string }>;
const texts = manifest as Record<string, string>;

describe('Hangcsomag', () => {
  it('a fájlnév-lenyomat ugyanaz, mint a játék szöveg-lenyomata (FNV-1a)', () => {
    for (const t of ['alma', 'Mondd ki hangosan a képek nevét!', 'ő ű']) {
      expect(clipKey(t)).toBe(hashString(t).toString(16).padStart(8, '0'));
    }
  });

  it('minden manifest-szöveghez van hangfájl (vagy saját felvétel)', () => {
    const missing = Object.entries(texts).filter(([id, text]) => !own.has(id) && !files.has(`${clipKey(text)}.mp3`));
    expect(missing.map(([id]) => id), 'gyártsd le: npm run hang').toEqual([]);
  });

  it('nincs gazdátlan hangfájl (amire semmi nem hivatkozik)', () => {
    const used = new Set(Object.values(texts).map((t) => `${clipKey(t)}.mp3`));
    expect([...files].filter((f) => !used.has(f))).toEqual([]);
  });

  it('minden hangfájl generálási dátuma naplózva van (licenc: az előfizetés alatt készült)', () => {
    for (const f of files) {
      const entry = log[f.slice(0, -4)];
      expect(entry, f).toBeTruthy();
      expect(Date.parse(entry!.generalva), f).toBeGreaterThan(Date.parse('2026-11-14T00:00:00Z'));
      expect(Date.parse(entry!.generalva), f).toBeLessThan(Date.parse('2026-12-14T11:00:00Z'));
    }
  });
});
