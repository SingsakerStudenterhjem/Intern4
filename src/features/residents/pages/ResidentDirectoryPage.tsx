import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getResidentDirectoryUsers } from '../../../server/dao/userDAO';
import { PageLayout } from '../../../shared/layouts';
import { ResidentDirectoryUser } from '../../../shared/types/user';
import { formatDate } from '../../../shared/utils/date';
import { RESIDENT_PATHS } from '../paths';
import {
  buildStatistics,
  filterResidents,
  formatAddress,
  formatRoom,
  formatStudy,
} from '../residentDirectory';
import type { ChartDatum } from '../residentDirectory';

type ChartTooltipPayload = {
  payload?: ChartDatum;
};

type ChartTooltipProps = {
  active?: boolean;
  label?: string;
  payload?: ChartTooltipPayload[];
};

const CHART_COLORS = ['#2563eb', '#0f766e', '#d97706', '#7c3aed', '#dc2626', '#4b5563'];

const formatDecimal = (value: number | null, suffix = ''): string => {
  if (value === null) return '-';
  return `${value.toFixed(1)}${suffix}`;
};

const formatDatum = (item: ChartDatum): string =>
  `${item.label}: ${item.value} (${item.percentage} %)`;

const ChartTooltip = ({ active, payload, label }: ChartTooltipProps) => {
  const item = payload?.[0]?.payload;

  if (!active || !item) return null;

  return (
    <div className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm">
      <p className="font-medium text-gray-900">{label ?? item.label}</p>
      <p className="text-gray-600">
        {item.value} beboere, {item.percentage} %
      </p>
    </div>
  );
};

type SummaryCardProps = {
  title: string;
  value: string;
  detail: string;
};

const SummaryCard = ({ title, value, detail }: SummaryCardProps) => (
  <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
    <h2 className="text-sm font-medium text-gray-600">{title}</h2>
    <p className="mt-2 text-2xl font-semibold text-gray-950">{value}</p>
    <p className="mt-1 text-sm text-gray-500">{detail}</p>
  </section>
);

type ChartCardProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  data: ChartDatum[];
};

const ChartCard = ({ title, description, children, data }: ChartCardProps) => (
  <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
    <div className="mb-4">
      <h2 className="text-lg font-semibold text-gray-950">{title}</h2>
      <p className="mt-1 text-sm text-gray-600">{description}</p>
    </div>
    {children}
    <ul className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
      {data
        .filter((item) => item.value > 0)
        .map((item) => (
          <li
            key={item.label}
            className="flex items-center justify-between gap-3 text-gray-600"
            aria-label={formatDatum(item)}
          >
            <span className="truncate" title={item.label}>
              {item.label}
            </span>
            <span className="shrink-0 font-medium text-gray-900">
              {item.value} ({item.percentage} %)
            </span>
          </li>
        ))}
    </ul>
  </section>
);

type VerticalDistributionChartProps = {
  title: string;
  description: string;
  data: ChartDatum[];
};

const VerticalDistributionChart = ({
  title,
  description,
  data,
}: VerticalDistributionChartProps) => (
  <ChartCard title={title} description={description} data={data}>
    <div className="h-72" aria-label={`${title} diagram`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 16, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#4b5563' }} />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#6b7280' }}
          />
          <Tooltip cursor={{ fill: '#f3f4f6' }} content={<ChartTooltip />} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#2563eb" aria-label={title}>
            {data.map((item, index) => (
              <Cell key={item.label} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
            <LabelList dataKey="value" position="top" className="fill-gray-700 text-xs" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </ChartCard>
);

const StudyYearChart = ({ data }: { data: ChartDatum[] }) => {
  const visibleData = data.filter((item) => item.value > 0);

  return (
    <ChartCard title="Studieår" description="Hvor i studieløpet dagens beboere er." data={data}>
      <div className="h-72" aria-label="Studieår diagram">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<ChartTooltip />} />
            <Pie
              data={visibleData}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={96}
              paddingAngle={2}
            >
              {visibleData.map((item, index) => (
                <Cell key={item.label} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
};

const CourseChart = ({ data }: { data: ChartDatum[] }) => {
  const chartHeight = Math.max(data.length * 44, 260);

  return (
    <ChartCard
      title="Studieprogram"
      description="De vanligste studiene i huset, med små grupper samlet som Annet."
      data={data}
    >
      <div className="overflow-x-auto">
        <div
          className="min-w-[560px]"
          style={{ height: chartHeight }}
          aria-label="Studieprogram diagram"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 8, right: 32, left: 24, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
              <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="label"
                width={150}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#4b5563', fontSize: 12 }}
              />
              <Tooltip cursor={{ fill: '#f3f4f6' }} content={<ChartTooltip />} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} fill="#0f766e">
                {data.map((item, index) => (
                  <Cell key={item.label} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
                <LabelList dataKey="value" position="right" className="fill-gray-700 text-xs" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ChartCard>
  );
};

type StatisticsDashboardProps = {
  statistics: ReturnType<typeof buildStatistics>;
};

const StatisticsDashboard = ({ statistics }: StatisticsDashboardProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard
          title="Aktive beboere"
          value={String(statistics.summary.totalResidents)}
          detail="Med i dagens beboerliste"
        />
        <SummaryCard
          title="Snittalder"
          value={formatDecimal(statistics.summary.averageAge, ' år')}
          detail="Basert på registrert fødselsdato"
        />
        <SummaryCard
          title="Snitt studieår"
          value={formatDecimal(statistics.summary.averageStudyYear)}
          detail="Beboere med 1.-5. studieår"
        />
        <SummaryCard
          title="Snitt botid"
          value={formatDecimal(statistics.summary.averageSemesters, ' semestre')}
          detail="Fra registrert innflytting"
        />
        <SummaryCard
          title="Vanligste studie"
          value={statistics.summary.mostCommonStudy ?? '-'}
          detail="Største registrerte studiegruppe"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <VerticalDistributionChart
          title="Aldersfordeling"
          description="Gir et raskt bilde av aldersspennet blant aktive beboere."
          data={statistics.ageGroups}
        />
        <StudyYearChart data={statistics.studyYears} />
        <VerticalDistributionChart
          title="Botid"
          description="Antall semestre beboerne har vært registrert på huset."
          data={statistics.semesters}
        />
        <CourseChart data={statistics.courses} />
      </div>
    </div>
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
  const showOldResidents = location.pathname === RESIDENT_PATHS.GAMLE_BEBOERE;
  const showStatistics = location.pathname === RESIDENT_PATHS.BEBOER_STATISTIKK;
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
    return filterResidents(residents, query, showOldResidents);
  }, [query, residents, showOldResidents]);

  const statistics = useMemo(() => buildStatistics(residents), [residents]);

  const title = showStatistics ? 'Statistikk' : showOldResidents ? 'Gamle beboere' : 'Beboerliste';
  const description = showStatistics
    ? 'Fordeling for aktive beboere etter alder, studieår, botid og studieprogram.'
    : showOldResidents
      ? 'Oversikt over tidligere beboere og registrert adresseinformasjon.'
      : 'Kontaktinformasjon og basisinfo for aktive beboere.';

  return (
    <PageLayout
      title={title}
      description={description}
      headerContent={
        <div className="flex flex-wrap items-center gap-2 pt-3">
          <ResidentTab to={RESIDENT_PATHS.BEBOERE} active={!showOldResidents && !showStatistics}>
            Beboerliste
          </ResidentTab>
          <ResidentTab to={RESIDENT_PATHS.BEBOER_STATISTIKK} active={showStatistics}>
            Statistikk
          </ResidentTab>
          <ResidentTab disabled>Beboerkart</ResidentTab>
          <ResidentTab to={RESIDENT_PATHS.GAMLE_BEBOERE} active={showOldResidents}>
            Gamle beboere
          </ResidentTab>
        </div>
      }
    >
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
            <StatisticsDashboard statistics={statistics} />
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
    </PageLayout>
  );
};

export default ResidentDirectoryPage;
