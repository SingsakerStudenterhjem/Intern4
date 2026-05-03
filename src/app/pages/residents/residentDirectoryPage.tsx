import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import { getResidentDirectoryUsers, ResidentDirectoryUser } from '../../../server/dao/userDAO';
import { ROUTES } from '../../constants/routes';

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

  const title = showOldResidents ? 'Gamle beboere' : 'Beboerliste';
  const description = showOldResidents
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
            <ResidentTab to={ROUTES.BEBOERE} active={!showOldResidents}>
              Beboerliste
            </ResidentTab>
            <ResidentTab disabled>Statistikk</ResidentTab>
            <ResidentTab disabled>Beboerkart</ResidentTab>
            <ResidentTab to={ROUTES.GAMLE_BEBOERE} active={showOldResidents}>
              Gamle beboere
            </ResidentTab>
          </div>
        </div>

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
      </div>
    </div>
  );
};

export default ResidentDirectoryPage;
