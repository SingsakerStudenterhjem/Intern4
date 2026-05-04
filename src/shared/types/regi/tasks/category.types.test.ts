import { describe, expect, it } from 'vitest';
import { safeParsCategory, safeParseCategory } from './category.types';

describe('category.types', () => {
  it('exposes the canonical safe category parser', () => {
    const result = safeParseCategory({
      id: 'category-1',
      name: 'Kjokken',
      color: '#3B82F6',
      isActive: true,
      createdAt: new Date('2026-04-10T10:00:00.000Z'),
    });

    expect(result.success).toBe(true);
  });

  it('keeps the old safe parser alias compatible', () => {
    expect(safeParsCategory).toBe(safeParseCategory);
  });
});
