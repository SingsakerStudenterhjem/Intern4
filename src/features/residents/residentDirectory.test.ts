import { describe, expect, it } from 'vitest';
import { buildStatistics, filterResidents, formatStudy } from './residentDirectory';
import { ResidentDirectoryUser } from '../../shared/types/user';

const resident = (overrides: Partial<ResidentDirectoryUser> = {}): ResidentDirectoryUser => ({
  id: '1',
  name: 'Test Beboer',
  email: 'test@example.test',
  phone: '40000001',
  birthDate: '2000-01-01',
  study: 'Datateknologi',
  studyPlace: 'NTNU',
  seniority: 2,
  roomNumber: 260,
  createdAt: '2024-08-15T00:00:00.000Z',
  role: 'Halv/Halv',
  onLeave: false,
  isActive: true,
  address: {
    street: 'Testgata 1',
    postalCode: '7016',
    city: 'Trondheim',
  },
  ...overrides,
});

describe('residentDirectory', () => {
  it('formats study and study place with seniority', () => {
    expect(formatStudy(resident())).toBe('2. Datateknologi (NTNU)');
    expect(formatStudy(resident({ study: '', studyPlace: '' }))).toBe('-');
  });

  it('filters old residents by address fields and active residents by contact fields', () => {
    expect(filterResidents([resident()], 'trondheim', true)).toHaveLength(1);
    expect(filterResidents([resident()], '40000001', false)).toHaveLength(1);
    expect(filterResidents([resident()], '40000001', true)).toHaveLength(0);
  });

  it('builds resident statistics from resident fields', () => {
    const statistics = buildStatistics([
      resident(),
      resident({ id: '2', birthDate: null, study: '', seniority: 9, createdAt: null }),
    ]);

    expect(statistics.birthYears).toEqual([
      { label: '2000', value: 1 },
      { label: 'Ukjent', value: 1 },
    ]);
    expect(statistics.studyYears.find((item) => item.label === '2')?.value).toBe(1);
    expect(statistics.studyYears.find((item) => item.label === 'Ukjent')?.value).toBe(1);
    expect(statistics.courses).toContainEqual({ label: 'Annet', value: 1 });
  });
});
