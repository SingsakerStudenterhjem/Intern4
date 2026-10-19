import { describe, expect, it } from 'vitest';
import { getSemesterName, getSemesterStart } from './semester';

describe('semester', () => {
  it('starts the spring semester on 1 January', () => {
    expect(getSemesterStart(new Date(2026, 6, 31))).toEqual(new Date(2026, 0, 1));
    expect(getSemesterName(new Date(2026, 6, 31))).toBe('Vår 2026');
  });

  it('starts the autumn semester on 1 August', () => {
    expect(getSemesterStart(new Date(2026, 7, 1))).toEqual(new Date(2026, 7, 1));
    expect(getSemesterName(new Date(2026, 11, 31))).toBe('Høst 2026');
  });
});
