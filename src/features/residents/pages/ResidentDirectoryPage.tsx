import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mail, MessageSquare, Phone } from 'lucide-react';
import { getResidentDirectoryUsers } from '../../../server/dao/userDAO';
import { PageLayout } from '../../../shared/layouts';
import { ResidentDirectoryUser } from '../../../shared/types/user';
import { formatDate } from '../../../shared/utils/date';
import { formatPhoneDisplay, toPhoneHref } from '../../../shared/utils/phone';
import {
  Badge,
  DataTable,
  EmptyState,
  SearchInput,
  SectionTabs,
  Skeleton,
  StatusMessage,
} from '../../../shared/components';
import { RESIDENT_PATHS } from '../paths';
import {
  buildStatistics,
  filterResidents,
  formatAddress,
  formatRoom,
  formatStudy,
} from '../residentDirectory';
import { StatisticsDashboard } from '../components/ResidentStatistics';

const TABS = [
  { key: 'list', label: 'Beboerliste', path: RESIDENT_PATHS.BEBOERE },
  { key: 'stats', label: 'Statistikk', path: RESIDENT_PATHS.BEBOER_STATISTIKK },
  { key: 'old', label: 'Gamle beboere', path: RESIDENT_PATHS.GAMLE_BEBOERE },
] as const;

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

const contactButtonClasses =
  'inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface text-primary transition-colors hover:bg-primary-subtle';

const ContactActions = ({ resident }: { resident: ResidentDirectoryUser }) => (
  <div className="flex gap-2">
    {resident.phone && (
      <>
        <a
          href={`tel:${toPhoneHref(resident.phone)}`}
          aria-label={`Ring ${resident.name}`}
          className={contactButtonClasses}
        >
          <Phone aria-hidden="true" className="h-5 w-5" />
        </a>
        <a
          href={`sms:${toPhoneHref(resident.phone)}`}
          aria-label={`Send SMS til ${resident.name}`}
          className={contactButtonClasses}
        >
          <MessageSquare aria-hidden="true" className="h-5 w-5" />
        </a>
      </>
    )}
    {resident.email && (
      <a
        href={`mailto:${resident.email}`}
        aria-label={`Send e-post til ${resident.name}`}
        className={contactButtonClasses}
      >
        <Mail aria-hidden="true" className="h-5 w-5" />
      </a>
    )}
  </div>
);

const ResidentCard = ({ resident }: { resident: ResidentDirectoryUser }) => (
  <div className="space-y-3">
    <div className="flex items-start gap-3">
      <span
        aria-hidden="true"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-sm font-semibold text-primary-subtle-fg"
      >
        {initials(resident.name)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="font-semibold">{resident.name}</p>
          {formatRoom(resident.roomNumber) !== '-' && (
            <Badge tone="primary">Rom {formatRoom(resident.roomNumber)}</Badge>
          )}
        </div>
        {formatStudy(resident) !== '-' && (
          <p className="mt-0.5 text-sm text-muted">{formatStudy(resident)}</p>
        )}
        {resident.phone && (
          <p className="text-sm text-subtle">{formatPhoneDisplay(resident.phone)}</p>
        )}
      </div>
    </div>
    <ContactActions resident={resident} />
  </div>
);

const ResidentDirectoryPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = TABS.find((tab) => tab.path === location.pathname)?.key ?? 'list';
  const showOldResidents = activeTab === 'old';
  const showStatistics = activeTab === 'stats';
  const [residents, setResidents] = useState<ResidentDirectoryUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  // isCurrent lets a slower request from a previous tab be ignored after switching tabs.
  const loadResidents = useCallback(
    async (isCurrent: () => boolean = () => true): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        const data = await getResidentDirectoryUsers(!showOldResidents);
        if (isCurrent()) setResidents(data);
      } catch (err) {
        console.error(err);
        if (isCurrent()) setError('Kunne ikke laste beboere.');
      } finally {
        if (isCurrent()) setLoading(false);
      }
    },
    [showOldResidents]
  );

  useEffect(() => {
    let current = true;
    void loadResidents(() => current);
    return () => {
      current = false;
    };
  }, [loadResidents]);

  const filteredResidents = useMemo(
    () => filterResidents(residents, query, showOldResidents),
    [query, residents, showOldResidents]
  );

  const statistics = useMemo(() => buildStatistics(residents), [residents]);

  const title = showStatistics ? 'Statistikk' : showOldResidents ? 'Gamle beboere' : 'Beboerliste';
  const description = showStatistics
    ? 'Fordeling for nåværende beboere etter alder, studieår, botid og studieprogram.'
    : showOldResidents
      ? 'Oversikt over tidligere beboere og registrert adresseinformasjon.'
      : 'Kontaktinformasjon og basisinfo for nåværende beboere.';

  const loadingState = (
    <div aria-label="Laster beboere" aria-busy="true" className="space-y-3">
      {[0, 1, 2, 3].map((index) => (
        <Skeleton key={index} className="h-28 rounded-2xl md:h-12" />
      ))}
    </div>
  );

  return (
    <PageLayout title={title} description={description}>
      <SectionTabs
        label="Beboere"
        tabs={TABS.map(({ key, label }) => ({ key, label }))}
        activeKey={activeTab}
        onChange={(key) => navigate(TABS.find((tab) => tab.key === key)!.path)}
      />

      {error && <StatusMessage tone="error">{error}</StatusMessage>}

      {showStatistics ? (
        loading ? (
          loadingState
        ) : residents.length === 0 ? (
          <EmptyState title="Ingen beboere funnet." />
        ) : (
          <StatisticsDashboard statistics={statistics} />
        )
      ) : (
        <div className="space-y-4">
          <SearchInput
            value={query}
            onChange={setQuery}
            label="Søk etter beboere"
            placeholder={
              showOldResidents
                ? 'Søk etter navn, adresse eller postnummer...'
                : 'Søk etter navn, rom, telefon, e-post, studie eller rolle...'
            }
          />

          {loading ? (
            loadingState
          ) : showOldResidents ? (
            <DataTable
              rows={filteredResidents}
              getRowKey={(resident) => resident.id}
              emptyMessage="Ingen gamle beboere funnet."
              renderCard={(resident) => (
                <div>
                  <p className="font-semibold">{resident.name}</p>
                  <p className="text-sm text-muted">
                    {formatAddress(resident)}
                    {resident.address.postalCode && ` · ${resident.address.postalCode}`}
                  </p>
                </div>
              )}
              columns={[
                { key: 'name', header: 'Navn', render: (resident) => resident.name },
                {
                  key: 'address',
                  header: 'Adresse',
                  render: (resident) => formatAddress(resident),
                },
                {
                  key: 'postalCode',
                  header: 'Postnummer',
                  render: (resident) => resident.address.postalCode || '-',
                },
              ]}
            />
          ) : (
            <DataTable
              rows={filteredResidents}
              getRowKey={(resident) => resident.id}
              emptyMessage="Ingen beboere funnet."
              renderCard={(resident) => <ResidentCard resident={resident} />}
              columns={[
                {
                  key: 'name',
                  header: 'Navn',
                  className: 'font-medium whitespace-nowrap',
                  render: (resident) => resident.name,
                },
                {
                  key: 'room',
                  header: 'Rom',
                  render: (resident) => formatRoom(resident.roomNumber),
                },
                {
                  key: 'phone',
                  header: 'Telefon',
                  className: 'whitespace-nowrap',
                  render: (resident) =>
                    resident.phone ? (
                      <a
                        href={`tel:${toPhoneHref(resident.phone)}`}
                        className="text-primary hover:underline"
                      >
                        {formatPhoneDisplay(resident.phone)}
                      </a>
                    ) : (
                      '-'
                    ),
                },
                {
                  key: 'email',
                  header: 'E-post',
                  render: (resident) =>
                    resident.email ? (
                      <a href={`mailto:${resident.email}`} className="text-primary hover:underline">
                        {resident.email}
                      </a>
                    ) : (
                      '-'
                    ),
                },
                { key: 'study', header: 'Studie', render: (resident) => formatStudy(resident) },
                {
                  key: 'born',
                  header: 'Født',
                  className: 'whitespace-nowrap',
                  render: (resident) => formatDate(resident.birthDate),
                },
                {
                  key: 'role',
                  header: 'Rolle',
                  render: (resident) => <Badge>{resident.role ?? 'Ingen rolle'}</Badge>,
                },
              ]}
            />
          )}

          {!loading && (
            <p className="text-sm text-subtle">
              Viser {filteredResidents.length} av {residents.length}{' '}
              {showOldResidents ? 'gamle beboere' : 'beboere'}
            </p>
          )}
        </div>
      )}
    </PageLayout>
  );
};

export default ResidentDirectoryPage;
