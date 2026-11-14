import { describe, expect, it } from 'vitest';
import { nearestSlot, type Box } from '../../src/engine/snap';

const box = (x: number, y: number, s = 60): Box => ({ left: x, top: y, width: s, height: s });

describe('nearestSlot', () => {
  const slots = [box(0, 0), box(0, 100), box(0, 200)]; // közepek: (30,30) (30,130) (30,230)

  it('a legközelebbi helyet adja', () => {
    expect(nearestSlot({ x: 30, y: 120 }, slots, 80)).toBe(1);
    expect(nearestSlot({ x: 40, y: 215 }, slots, 80)).toBe(2);
  });

  it('érvénytelen helyen (túl messze) null', () => {
    expect(nearestSlot({ x: 400, y: 400 }, slots, 80)).toBeNull();
  });

  it('nincs hely: null', () => {
    expect(nearestSlot({ x: 0, y: 0 }, [], 80)).toBeNull();
  });

  it('két oszlopban is a legközelebbit választja', () => {
    const two = [box(0, 0), box(200, 0), box(0, 100), box(200, 100)];
    expect(nearestSlot({ x: 230, y: 130 }, two, 90)).toBe(3);
    expect(nearestSlot({ x: 40, y: 20 }, two, 90)).toBe(0);
  });
});
