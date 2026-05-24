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

  it('filters old residents by address fields and current residents by contact fields', () => {
    expect(filterResidents([resident()], 'trondheim', true)).toHaveLength(1);
    expect(filterResidents([resident()], '40000001', false)).toHaveLength(1);
    expect(filterResidents([resident()], '40000001', true)).toHaveLength(0);
  });

  it('builds resident statistics from resident fields', () => {
    const statistics = buildStatistics(
      [
        resident(),
        resident({ id: '2', birthDate: null, study: '', seniority: 9, createdAt: null }),
      ],
      new Date('2026-05-24T12:00:00.000Z')
    );

    expect(statistics.summary).toEqual({
      totalResidents: 2,
      averageAge: 26,
      averageStudyYear: 2,
      averageSemesters: 4,
      mostCommonStudy: 'Datateknologi',
    });
    expect(statistics.ageGroups.find((item) => item.label === '26+')).toEqual({
      label: '26+',
      value: 1,
      percentage: 50,
    });
    expect(statistics.ageGroups.find((item) => item.label === 'Ukjent')).toEqual({
      label: 'Ukjent',
      value: 1,
      percentage: 50,
    });
    expect(statistics.studyYears.find((item) => item.label === '2')).toEqual({
      label: '2',
      value: 1,
      percentage: 50,
    });
    expect(statistics.studyYears.find((item) => item.label === 'Ukjent')).toEqual({
      label: 'Ukjent',
      value: 1,
      percentage: 50,
    });
    expect(statistics.semesters.find((item) => item.label === '3-4')).toEqual({
      label: '3-4',
      value: 1,
      percentage: 50,
    });
    expect(statistics.courses).toContainEqual({ label: 'Annet', value: 1, percentage: 50 });
  });

  it('groups small study programs under Annet', () => {
    const residents = Array.from({ length: 10 }, (_, index) =>
      resident({
        id: String(index + 1),
        study: `Studie ${index + 1}`,
      })
    );

    const statistics = buildStatistics(residents, new Date('2026-05-24T12:00:00.000Z'));

    expect(statistics.courses).toHaveLength(9);
    expect(statistics.courses.slice(0, 8).map((item) => item.label)).toEqual([
      'Studie 1',
      'Studie 2',
      'Studie 3',
      'Studie 4',
      'Studie 5',
      'Studie 6',
      'Studie 7',
      'Studie 8',
    ]);
    expect(statistics.courses.at(-1)).toEqual({ label: 'Annet', value: 2, percentage: 20 });
  });
});
