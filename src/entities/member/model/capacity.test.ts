import { describe, expect, it } from 'vitest';

import type { Member } from '@/shared/api';

import { memberCapacity } from './capacity';

const base: Member = { id: 'm', name: 'Test Person', skill: 'backend', hoursPerDay: 8, focusFactor: 0.75, ptoDays: 0, onCallDays: 0 };
const sprint = { name: 'S', workingDays: 10 };

describe('memberCapacity', () => {
  it('multiplies available days, hours and focus factor', () => {
    expect(memberCapacity(base, sprint)).toBe(60);
  });
  it('removes PTO and half of each on-call day', () => {
    expect(memberCapacity({ ...base, ptoDays: 2, onCallDays: 2 }, sprint)).toBe(7 * 8 * 0.75);
  });
  it('never goes negative', () => {
    expect(memberCapacity({ ...base, ptoDays: 15 }, sprint)).toBe(0);
  });
  it('rounds down to the half hour', () => {
    expect(memberCapacity({ ...base, hoursPerDay: 7, focusFactor: 0.65 }, sprint)).toBe(45.5);
    expect(memberCapacity({ ...base, hoursPerDay: 7, focusFactor: 0.66 }, sprint)).toBe(46);
  });
});
