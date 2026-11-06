import { describe, expect, it } from 'vitest';

import { capitalize, formatHours, formatPercent } from './format';

describe('format helpers', () => {
  it('formats hours, percentages and labels', () => {
    expect(formatHours(12)).toBe('12h');
    expect(formatHours(45.5)).toBe('45.5h');
    expect(formatPercent(0.873)).toBe('87%');
    expect(capitalize('frontend')).toBe('Frontend');
  });
});
