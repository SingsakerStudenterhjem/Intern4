import { describe, expect, it } from 'vitest';
import { formatDateColumnValue } from './date';

describe('date utils', () => {
  it('formats date-only values in the app timezone', () => {
    expect(formatDateColumnValue(new Date('2026-04-20T22:30:00.000Z'))).toBe('2026-04-21');
  });
});
