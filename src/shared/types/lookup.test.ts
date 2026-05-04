import { describe, expect, it } from 'vitest';
import { getDefaultLookupId } from './lookup';

describe('lookup helpers', () => {
  it('prefers Annet as the default lookup option', () => {
    expect(
      getDefaultLookupId([
        { id: 'school-ntnu', name: 'NTNU' },
        { id: 'school-annet', name: 'Annet' },
      ])
    ).toBe('school-annet');
  });

  it('falls back to the first option or an empty id', () => {
    expect(getDefaultLookupId([{ id: 'school-bi', name: 'BI' }])).toBe('school-bi');
    expect(getDefaultLookupId([])).toBe('');
  });
});
