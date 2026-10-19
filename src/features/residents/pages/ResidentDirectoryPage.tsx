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
import { useChartColors } from '../../../app/providers/ThemeProvider';
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
    <div className="rounded-md border border-border bg-surface px-3 py-2 text-sm shadow-sm">
      <p className="font-medium text-fg">{label ?? item.label}</p>
      <p className="text-muted">
        {item.value} beboere, {item.percentage} %
      </p>
    </div>
  );
};

type SummaryCardProps = {
  title: string;
  value: string;
  detail: string;
  className?: string;
};

const SummaryCard = ({ title, value, detail, className = '' }: SummaryCardProps) => (
  <section className={`rounded-lg border border-border bg-surface p-3 shadow-sm ${className}`}>
    <h2 className="text-xs font-medium text-muted">{title}</h2>
    <p className="mt-1 text-lg font-semibold leading-tight text-fg">{value}</p>
    <p className="mt-1 text-xs leading-snug text-subtle">{detail}</p>
  </section>
);

type ChartCardProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  data: ChartDatum[];
};

const ChartCard = ({ title, description, children, data }: ChartCardProps) => (
  <section className="rounded-lg border border-border bg-surface p-3 shadow-sm">
    <div className="mb-2">
      <h2 className="text-base font-semibold text-fg">{title}</h2>
      <p className="mt-0.5 text-xs leading-snug text-muted">{description}</p>
    </div>
    {children}
    <ul className="mt-2 grid grid-cols-1 gap-x-3 gap-y-1 text-xs sm:grid-cols-2">
      {data
        .filter((item) => item.value > 0)
        .map((item) => (
          <li
            key={item.label}
            className="flex min-w-0 items-center justify-between gap-2 text-muted"
            aria-label={formatDatum(item)}
          >
            <span className="truncate" title={item.label}>
              {item.label}
            </span>
            <span className="shrink-0 font-medium text-fg">
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
}: VerticalDistributionChartProps) => {
  const colors = useChartColors();

  return (
    <ChartCard title={title} description={description} data={data}>
      <div className="h-40 sm:h-44" aria-label={`${title} diagram`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 14, right: 4, left: -28, bottom: -4 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grid} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: colors.axis, fontSize: 11 }}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fill: colors.axis, fontSize: 11 }}
            />
            <Tooltip cursor={{ fill: colors.cursor }} content={<ChartTooltip />} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} fill={colors.series[0]} aria-label={title}>
              {data.map((item, index) => (
                <Cell key={item.label} fill={colors.series[index % colors.series.length]} />
              ))}
              <LabelList dataKey="value" position="top" className="fill-muted text-xs" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
};

const StudyYearChart = ({ data }: { data: ChartDatum[] }) => {
  const visibleData = data.filter((item) => item.value > 0);
  const colors = useChartColors();

  return (
    <ChartCard title="Studieår" description="Hvor i studieløpet dagens beboere er." data={data}>
      <div className="h-40 sm:h-44" aria-label="Studieår diagram">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<ChartTooltip />} />
            <Pie
              data={visibleData}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={34}
              outerRadius={58}
              paddingAngle={2}
            >
              {visibleData.map((item, index) => (
                <Cell key={item.label} fill={colors.series[index % colors.series.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
};

const CourseChart = ({ data }: { data: ChartDatum[] }) => {
  const chartHeight = Math.min(Math.max(data.length * 28, 150), 240);
  const colors = useChartColors();

  return (
    <ChartCard
      title="Studieprogram"
      description="De vanligste studiene i huset, med små grupper samlet som Annet."
      data={data}
    >
      <div className="overflow-x-auto">
        <div
          className="min-w-[300px]"
          style={{ height: chartHeight }}
          aria-label="Studieprogram diagram"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 4, right: 24, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={colors.grid} />
              <XAxis
                type="number"
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fill: colors.axis, fontSize: 11 }}
              />
              <YAxis
                type="category"
                dataKey="label"
                width={112}
                tickLine={false}
                axisLine={false}
                tick={{ fill: colors.axis, fontSize: 11 }}
              />
              <Tooltip cursor={{ fill: colors.cursor }} content={<ChartTooltip />} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} fill={colors.series[1]}>
                {data.map((item, index) => (
                  <Cell key={item.label} fill={colors.series[index % colors.series.length]} />
                ))}
                <LabelList dataKey="value" position="right" className="fill-muted text-xs" />
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
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <SummaryCard
          title="Nåværende beboere"
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
          className="col-span-2 lg:col-span-1"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <VerticalDistributionChart
          title="Aldersfordeling"
          description="Gir et raskt bilde av aldersspennet blant nåværende beboere."
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
        className={`${baseClass} cursor-not-allowed bg-surface-muted text-subtle`}
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
        active
          ? 'bg-primary-subtle text-primary'
          : 'text-muted hover:bg-surface-muted hover:text-fg'
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
    ? 'Fordeling for nåværende beboere etter alder, studieår, botid og studieprogram.'
    : showOldResidents
      ? 'Oversikt over tidligere beboere og registrert adresseinformasjon.'
      : 'Kontaktinformasjon og basisinfo for nåværende beboere.';

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
            <div className="mb-6 p-4 bg-danger-subtle border border-danger-border rounded-md">
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="bg-surface rounded-lg shadow flex justify-center py-12">
              <div
                className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"
                aria-label="Laster beboere"
              ></div>
            </div>
          ) : residents.length === 0 ? (
            <div className="bg-surface rounded-lg shadow px-6 py-8 text-center text-subtle">
              Ingen beboere funnet.
            </div>
          ) : (
            <StatisticsDashboard statistics={statistics} />
          )}
        </>
      ) : (
        <div className="bg-surface rounded-lg shadow">
          <div className="p-6 border-b border-border">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-subtle w-5 h-5" />
                <input
                  type="text"
                  placeholder={
                    showOldResidents
                      ? 'Søk etter navn, adresse eller postnummer...'
                      : 'Søk etter navn, rom, telefon, e-post, studie eller rolle...'
                  }
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="m-6 p-4 bg-danger-subtle border border-danger-border rounded-md">
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center py-12">
                <div
                  className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"
                  aria-label="Laster beboere"
                ></div>
              </div>
            ) : showOldResidents ? (
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-surface-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-subtle uppercase tracking-wider">
                      Navn
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-subtle uppercase tracking-wider">
                      Adresse
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-subtle uppercase tracking-wider">
                      Postnummer
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-surface divide-y divide-border">
                  {filteredResidents.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-subtle">
                        Ingen gamle beboere funnet.
                      </td>
                    </tr>
                  ) : (
                    filteredResidents.map((resident) => (
                      <tr key={resident.id} className="hover:bg-surface-muted">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-fg">
                          {resident.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
                          {formatAddress(resident)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
                          {resident.address.postalCode || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-surface-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-subtle uppercase tracking-wider">
                      Navn
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-subtle uppercase tracking-wider">
                      Rom
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-subtle uppercase tracking-wider">
                      Telefon
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-subtle uppercase tracking-wider">
                      E-post
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-subtle uppercase tracking-wider">
                      Studie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-subtle uppercase tracking-wider">
                      Født
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-subtle uppercase tracking-wider">
                      Rolle
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-surface divide-y divide-border">
                  {filteredResidents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-subtle">
                        Ingen beboere funnet.
                      </td>
                    </tr>
                  ) : (
                    filteredResidents.map((resident) => (
                      <tr key={resident.id} className="hover:bg-surface-muted">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-fg">
                          {resident.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
                          {formatRoom(resident.roomNumber)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
                          {resident.phone || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">
                          {resident.email || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
                          {formatStudy(resident)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
                          {formatDate(resident.birthDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
                          {resident.role ?? 'Ingen rolle'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          <div className="px-6 py-3 border-t border-border text-sm text-subtle">
            Viser {filteredResidents.length} av {residents.length}{' '}
            {showOldResidents ? 'gamle beboere' : 'beboere'}
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default ResidentDirectoryPage;
