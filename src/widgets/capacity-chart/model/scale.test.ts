import { describe, expect, it } from 'vitest';

import { niceScale } from './scale';

describe('niceScale', () => {
  it('rounds the axis up to whole, readable steps', () => {
    expect(niceScale(49)).toEqual({ max: 50, ticks: [0, 10, 20, 30, 40, 50] });
    expect(niceScale(100)).toEqual({ max: 100, ticks: [0, 25, 50, 75, 100] });
    expect(niceScale(7)).toEqual({ max: 8, ticks: [0, 2, 4, 6, 8] });
  });
  it('handles an empty team', () => {
    expect(niceScale(0)).toEqual({ max: 1, ticks: [0, 1] });
  });
});
