import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import { getResidentDirectoryUsers } from '../../../server/dao/userDAO';
import { ResidentDirectoryUser } from '../../../shared/types/user';
import { ROUTES } from '../../../app/constants/routes';

const formatDate = (value: string | null): string => {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleDateString('no-NO');
};

const formatRoom = (roomNumber: number | null): string => {
  if (roomNumber === null || roomNumber === 0) return '-';
  return String(roomNumber);
};

const formatStudy = (resident: ResidentDirectoryUser): string => {
  const prefix = resident.seniority > 0 ? `${resident.seniority}. ` : '';
  const study = resident.study.trim();
  const studyPlace = resident.studyPlace.trim();

  if (!study && !studyPlace) return '-';
  if (!study) return studyPlace;
  if (!studyPlace) return `${prefix}${study}`;

  return `${prefix}${study} (${studyPlace})`;
};

const formatAddress = (resident: ResidentDirectoryUser): string => {
  const parts = [resident.address.street, resident.address.city].filter((part) => part?.trim());
  return parts.length > 0 ? parts.join(', ') : '-';
};

const includesQuery = (value: unknown, query: string): boolean =>
  String(value ?? '')
    .toLowerCase()
    .includes(query);

type ChartDatum = {
  label: string;
  value: number;
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

const buildStatistics = (residents: ResidentDirectoryUser[]) => {
  return {
    birthYears: countByLabel(residents.map((resident) => getBirthYear(resident.birthDate))),
    studyYears: ['1', '2', '3', '4', '5', 'Ukjent'].map((year) => ({
      label: year,
      value: residents.filter((resident) => getStudyYear(resident.seniority) === year).length,
    })),
    semesters: countByLabel(residents.map((resident) => getSemesterCount(resident.createdAt))),
    // TODO: maybe we should add courses as its own db table later.
    courses: countByLabel(
      residents.map((resident) => {
        const study = resident.study.trim();
        return study || 'Annet';
      })
    ),
  };
};

type BarChartProps = {
  title: string;
  data: ChartDatum[];
};

type ColumnChartProps = BarChartProps & {
  averageLabel?: string;
};

const getAverage = (data: ChartDatum[]): number | null => {
  const values = data.flatMap((item) => {
    const numericLabel = Number(item.label);
    if (!Number.isFinite(numericLabel)) return [];
    return Array.from({ length: item.value }, () => numericLabel);
  });

  if (values.length === 0) return null;

  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const ColumnChart = ({ title, data, averageLabel = 'Gjennomsnitt' }: ColumnChartProps) => {
  const maxValue = Math.max(...data.map((item) => item.value), 1);
  const average = getAverage(data);

  return (
    <section className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
      <div className="overflow-x-auto">
        <div className="flex items-end gap-3 min-w-max h-64 pb-2">
          {data.map((item) => {
            const height = item.value === 0 ? 0 : Math.max((item.value / maxValue) * 100, 8);

            return (
              <div key={item.label} className="w-12 flex flex-col items-center justify-end gap-2">
                <div className="h-52 flex items-end">
                  <div
                    className="w-9 rounded-t-md bg-blue-600 flex items-start justify-center pt-1 text-xs font-semibold text-white"
                    style={{ height: `${height}%` }}
                    aria-label={`${item.label}: ${item.value}`}
                  >
                    {item.value > 0 ? item.value : ''}
                  </div>
                </div>
                <div className="text-sm text-gray-700 whitespace-nowrap">{item.label}</div>
              </div>
            );
          })}
        </div>
      </div>
      {average !== null && (
        <p className="mt-3 text-sm text-gray-600">
          {averageLabel}: <span className="font-medium text-gray-900">{average.toFixed(2)}</span>
        </p>
      )}
    </section>
  );
};

const HorizontalBarChart = ({ title, data }: BarChartProps) => {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <section className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
      <div className="space-y-3">
        {data.map((item) => {
          const width = item.value === 0 ? 0 : Math.max((item.value / maxValue) * 100, 4);

          return (
            <div key={item.label} className="grid grid-cols-[96px_1fr_44px] items-center gap-3">
              <div className="text-sm text-gray-700 truncate" title={item.label}>
                {item.label}
              </div>
              <div className="h-7 rounded-md bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-md bg-blue-600"
                  style={{ width: `${width}%` }}
                  aria-label={`${item.label}: ${item.value}`}
                ></div>
              </div>
              <div className="text-sm font-medium text-gray-900 text-right">{item.value}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

type ResidentTabProps = {
  to?: string;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
};

const ResidentTab = ({ to, active = false, disabled = false, children }: ResidentTabProps) => {
  const baseClass =
    'inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors';

  if (disabled || !to) {
    return (
      <span
        className={`${baseClass} cursor-not-allowed bg-gray-100 text-gray-400`}
        aria-disabled="true"
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      to={to}
      className={`${baseClass} ${
        active ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {children}
    </Link>
  );
};

const ResidentDirectoryPage: React.FC = () => {
  const location = useLocation();
  const showOldResidents = location.pathname === ROUTES.GAMLE_BEBOERE;
  const showStatistics = location.pathname === ROUTES.BEBOER_STATISTIKK;
  const [residents, setResidents] = useState<ResidentDirectoryUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const loadResidents = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const data = await getResidentDirectoryUsers(!showOldResidents);
      setResidents(data);
    } catch (err) {
      console.error(err);
      setError('Kunne ikke laste beboere.');
    } finally {
      setLoading(false);
    }
  }, [showOldResidents]);

  useEffect(() => {
    void loadResidents();
  }, [loadResidents]);

  const filteredResidents = useMemo(() => {
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
  }, [query, residents, showOldResidents]);

  const statistics = useMemo(() => buildStatistics(residents), [residents]);

  const title = showStatistics ? 'Statistikk' : showOldResidents ? 'Gamle beboere' : 'Beboerliste';
  const description = showStatistics
    ? 'Fordeling for aktive beboere etter alder, studieår, botid og studieprogram.'
    : showOldResidents
      ? 'Oversikt over tidligere beboere og registrert adresseinformasjon.'
      : 'Kontaktinformasjon og basisinfo for aktive beboere.';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-600 mt-1">{description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ResidentTab to={ROUTES.BEBOERE} active={!showOldResidents && !showStatistics}>
              Beboerliste
            </ResidentTab>
            <ResidentTab to={ROUTES.BEBOER_STATISTIKK} active={showStatistics}>
              Statistikk
            </ResidentTab>
            <ResidentTab disabled>Beboerkart</ResidentTab>
            <ResidentTab to={ROUTES.GAMLE_BEBOERE} active={showOldResidents}>
              Gamle beboere
            </ResidentTab>
          </div>
        </div>

        {showStatistics ? (
          <>
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="bg-white rounded-lg shadow flex justify-center py-12">
                <div
                  className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
                  aria-label="Laster beboere"
                ></div>
              </div>
            ) : residents.length === 0 ? (
              <div className="bg-white rounded-lg shadow px-6 py-8 text-center text-gray-500">
                Ingen beboere funnet.
              </div>
            ) : (
              <div className="space-y-6">
                <ColumnChart title="Fødselsår" data={statistics.birthYears} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ColumnChart title="Studieår" data={statistics.studyYears} />
                  <ColumnChart title="Antall semestre på huset" data={statistics.semesters} />
                </div>
                <HorizontalBarChart title="Studieprogram" data={statistics.courses} />
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder={
                      showOldResidents
                        ? 'Søk etter navn, adresse eller postnummer...'
                        : 'Søk etter navn, rom, telefon, e-post, studie eller rolle...'
                    }
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div
                    className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
                    aria-label="Laster beboere"
                  ></div>
                </div>
              ) : showOldResidents ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Navn
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Adresse
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Postnummer
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredResidents.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                          Ingen gamle beboere funnet.
                        </td>
                      </tr>
                    ) : (
                      filteredResidents.map((resident) => (
                        <tr key={resident.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {resident.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatAddress(resident)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {resident.address.postalCode || '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Navn
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rom
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Telefon
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        E-post
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Studie
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Født
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rolle
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredResidents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                          Ingen beboere funnet.
                        </td>
                      </tr>
                    ) : (
                      filteredResidents.map((resident) => (
                        <tr key={resident.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {resident.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatRoom(resident.roomNumber)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {resident.phone || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                            {resident.email || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatStudy(resident)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatDate(resident.birthDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {resident.role ?? 'Ingen rolle'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>

            <div className="px-6 py-3 border-t border-gray-200 text-sm text-gray-500">
              Viser {filteredResidents.length} av {residents.length}{' '}
              {showOldResidents ? 'gamle beboere' : 'beboere'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResidentDirectoryPage;
