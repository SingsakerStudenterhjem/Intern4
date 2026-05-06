import { ResidentDirectoryUser } from '../../shared/types/user';

export type ChartDatum = {
  label: string;
  value: number;
};

export const formatRoom = (roomNumber: number | null): string => {
  if (roomNumber === null || roomNumber === 0) return '-';
  return String(roomNumber);
};

export const formatStudy = (resident: ResidentDirectoryUser): string => {
  const prefix = resident.seniority > 0 ? `${resident.seniority}. ` : '';
  const study = resident.study.trim();
  const studyPlace = resident.studyPlace.trim();

  if (!study && !studyPlace) return '-';
  if (!study) return studyPlace;
  if (!studyPlace) return `${prefix}${study}`;

  return `${prefix}${study} (${studyPlace})`;
};

export const formatAddress = (resident: ResidentDirectoryUser): string => {
  const parts = [resident.address.street, resident.address.city].filter((part) => part?.trim());
  return parts.length > 0 ? parts.join(', ') : '-';
};

const includesQuery = (value: unknown, query: string): boolean =>
  String(value ?? '')
    .toLowerCase()
    .includes(query);

export const filterResidents = (
  residents: ResidentDirectoryUser[],
  query: string,
  showOldResidents: boolean
): ResidentDirectoryUser[] => {
  const q = query.trim().toLowerCase();
  if (!q) return residents;

  return residents.filter((resident) => {
    const searchable = showOldResidents
      ? [
          resident.name,
          resident.address.street,
          resident.address.postalCode,
          resident.address.city,
          resident.address.country,
        ]
      : [
          resident.name,
          resident.roomNumber,
          resident.phone,
          resident.email,
          resident.study,
          resident.studyPlace,
          resident.seniority,
          resident.birthDate,
          resident.role,
        ];

    return searchable.some((value) => includesQuery(value, q));
  });
};

const countByLabel = (labels: string[]): ChartDatum[] => {
  const counts = labels.reduce<Record<string, number>>((acc, label) => {
    acc[label] = (acc[label] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => a.label.localeCompare(b.label, 'no', { numeric: true, sensitivity: 'base' }));
};

const getBirthYear = (birthDate: string | null): string => {
  if (!birthDate) return 'Ukjent';

  const date = new Date(birthDate);
  if (Number.isNaN(date.getTime())) return 'Ukjent';

  return String(date.getFullYear());
};

const getStudyYear = (seniority: number): string => {
  if (seniority >= 1 && seniority <= 5) return String(seniority);
  return 'Ukjent';
};

const getSemesterCount = (createdAt: string | null): string => {
  if (!createdAt) return 'Ukjent';

  const startDate = new Date(createdAt);
  if (Number.isNaN(startDate.getTime())) return 'Ukjent';

  const now = new Date();
  const startSemester = startDate.getFullYear() * 2 + (startDate.getMonth() >= 7 ? 1 : 0);
  const currentSemester = now.getFullYear() * 2 + (now.getMonth() >= 7 ? 1 : 0);

  return String(Math.max(currentSemester - startSemester + 1, 1));
};

export const buildStatistics = (residents: ResidentDirectoryUser[]) => {
  return {
    birthYears: countByLabel(residents.map((resident) => getBirthYear(resident.birthDate))),
    studyYears: ['1', '2', '3', '4', '5', 'Ukjent'].map((year) => ({
      label: year,
      value: residents.filter((resident) => getStudyYear(resident.seniority) === year).length,
    })),
    semesters: countByLabel(residents.map((resident) => getSemesterCount(resident.createdAt))),
    courses: countByLabel(
      residents.map((resident) => {
        const study = resident.study.trim();
        return study || 'Annet';
      })
    ),
  };
};
