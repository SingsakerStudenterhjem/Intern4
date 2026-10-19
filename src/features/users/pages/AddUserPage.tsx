import React, { useCallback, useEffect, useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { NewUserInput } from '../../../shared/types/user';
import { PageLayout } from '../../../shared/layouts';
import {
  createUser,
  deleteUser,
  getSchools,
  getStudies,
  getRoles,
  getAllUsersWithRole,
} from '../../../server/dao/userDAO';
import { BasicUserWithRole, Role } from '../../../shared/types/user';
import { getDefaultLookupId, LookupOption } from '../../../shared/types/lookup';
import {
  canSubmitNewUser,
  createEmptyNewUserInput,
  prepareNewUserInput,
  validateNewUserInput,
  validateUserField,
} from '../userLifecycle';

const getErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error ? error.message : fallback;

const AddUserPage: React.FC = () => {
  const [userData, setUserData] = useState<NewUserInput>(createEmptyNewUserInput());

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [birthDateString, setBirthDateString] = useState('');
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [schools, setSchools] = useState<LookupOption[]>([]);
  const [studies, setStudies] = useState<LookupOption[]>([]);
  const [lookupsLoading, setLookupsLoading] = useState(true);

  // User list state
  const [users, setUsers] = useState<BasicUserWithRole[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<BasicUserWithRole | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const lookupOptionsReady = !lookupsLoading && schools.length > 0 && studies.length > 0;
  const canSubmit = canSubmitNewUser(userData, { isSubmitting, lookupOptionsReady });

  const handleDeleteUser = async (user: BasicUserWithRole) => {
    setIsDeleting(true);
    try {
      await deleteUser(user.id);
      setMessage({ type: 'success', text: `${user.name} ble deaktivert` });
      setDeleteConfirm(null);
      await loadUsers();
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      setMessage({ type: 'error', text: getErrorMessage(err, 'Kunne ikke slette bruker') });
    } finally {
      setIsDeleting(false);
    }
  };

  const loadUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const data = await getAllUsersWithRole();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    getRoles()
      .then((data) => setRoles(data))
      .catch((err) => console.error('Failed to load roles:', err))
      .finally(() => setRolesLoading(false));

    Promise.all([getSchools(), getStudies()])
      .then(([schoolOptions, studyOptions]) => {
        setSchools(schoolOptions);
        setStudies(studyOptions);
        setUserData((prev) => ({
          ...prev,
          schoolId: prev.schoolId || getDefaultLookupId(schoolOptions),
          studyId: prev.studyId || getDefaultLookupId(studyOptions),
        }));
      })
      .catch((err) => console.error('Failed to load study lookups:', err))
      .finally(() => setLookupsLoading(false));

    void loadUsers();
  }, [loadUsers]);

  const availableRoles = Array.from(new Set(users.map((u) => u.role).filter(Boolean))).sort();

  const filteredUsers = users.filter((u) => {
    const matchesQuery =
      !query ||
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesQuery && matchesRole;
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (name === 'birthDate') {
      setBirthDateString(value);
      if (value) {
        setUserData((prev) => ({
          ...prev,
          birthDate: new Date(value),
        }));
      }
      return;
    }

    if (name.includes('.')) {
      const [, child] = name.split('.');
      setUserData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [child]: value,
        },
      }));
    } else {
      let processedValue: string | number | boolean = value;

      if (type === 'checkbox') {
        processedValue = (e.target as HTMLInputElement).checked;
      } else if (type === 'number') {
        processedValue = value === '' ? 0 : parseInt(value);
      }

      setUserData((prev) => ({
        ...prev,
        [name]: processedValue,
      }));
    }

    const fieldErrors = validateUserField(
      name,
      type === 'number' ? (value === '' ? 0 : parseInt(value)) : value
    );
    setValidationErrors((prev) => ({
      ...prev,
      ...fieldErrors,
      [name]: fieldErrors[name] || '',
    }));
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const allErrors = validateNewUserInput(userData);

    if (Object.values(allErrors).some((error) => error)) {
      setValidationErrors(allErrors);
      setMessage({ type: 'error', text: 'Vennligst rett feilene i skjemaet' });
      setIsSubmitting(false);
      return;
    }

    if (!userData.name.trim() || !userData.email.trim()) {
      setMessage({ type: 'error', text: 'Navn og e-post er obligatoriske felter' });
      setIsSubmitting(false);
      return;
    }

    if (!lookupOptionsReady) {
      setMessage({ type: 'error', text: 'Kunne ikke laste skoler og studier.' });
      setIsSubmitting(false);
      return;
    }

    try {
      const { initialPassword } = await createUser(prepareNewUserInput(userData, schools, studies));

      setMessage({
        type: 'success',
        text:
          `${userData.name} ble lagt til` +
          (initialPassword ? ` (midlertidig passord: ${initialPassword})` : ''),
      });

      setUserData(
        createEmptyNewUserInput(getDefaultLookupId(schools), getDefaultLookupId(studies))
      );
      setBirthDateString('');
      setValidationErrors({});
      setShowOptionalFields(false);
      setShowAddForm(false);
      await loadUsers();

      setTimeout(() => {
        setMessage(null);
      }, 4000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: getErrorMessage(error, 'En feil oppstod ved oppretting av bruker'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout
      title="Administrer brukere"
      description="Oversikt over brukere og opprett nye."
      actions={
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-fg bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
        >
          {showAddForm ? 'Skjul skjema' : 'Legg til bruker'}
        </button>
      }
    >
      {message && (
        <div
          className={`mb-6 p-3 rounded-md text-sm transition-all duration-300 ${
            message.type === 'success'
              ? 'bg-success-subtle text-success border border-success-border'
              : 'bg-danger-subtle text-danger-subtle-fg border border-danger-border'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Add User Form */}
      {showAddForm && (
        <div className="mb-8 bg-surface rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-fg mb-4">Ny bruker</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-muted mb-1">
                Navn *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={userData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                placeholder="Skriv inn fullt navn"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-muted mb-1">
                E-post *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={userData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                placeholder="navn@eksempel.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-muted mb-1">
                Rolle
              </label>
              <select
                id="role"
                name="role"
                value={userData.role}
                onChange={handleInputChange}
                disabled={rolesLoading}
                className="w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
              >
                {rolesLoading ? (
                  <option>Laster roller...</option>
                ) : (
                  roles.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label htmlFor="roomNumber" className="block text-sm font-medium text-muted mb-1">
                Romnummer
              </label>
              <input
                type="number"
                id="roomNumber"
                name="roomNumber"
                min="0"
                value={userData.roomNumber}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring ${
                  validationErrors.roomNumber ? 'border-danger-border' : 'border-input'
                }`}
                placeholder="260"
              />
              {validationErrors.roomNumber && (
                <p className="mt-1 text-sm text-danger">{validationErrors.roomNumber}</p>
              )}
            </div>
          </div>

          <div className="mb-4">
            <button
              type="button"
              onClick={() => setShowOptionalFields(!showOptionalFields)}
              className="flex items-center text-primary hover:text-primary-subtle-fg text-sm font-medium"
            >
              {showOptionalFields ? '− Skjul valgfrie felter' : '+ Vis valgfrie felter'}
            </button>
          </div>

          {showOptionalFields && (
            <div className="bg-surface-muted p-4 rounded-lg border border-border mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-muted mb-1">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={userData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring ${
                      validationErrors.phone ? 'border-danger-border' : 'border-input'
                    }`}
                    placeholder="+47 123 45 678"
                  />
                  {validationErrors.phone && (
                    <p className="mt-1 text-sm text-danger">{validationErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="birthDate" className="block text-sm font-medium text-muted mb-1">
                    Fodselsdato
                  </label>
                  <input
                    type="date"
                    id="birthDate"
                    name="birthDate"
                    value={birthDateString}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="seniority" className="block text-sm font-medium text-muted mb-1">
                    Ansiennitet (ar)
                  </label>
                  <input
                    type="number"
                    id="seniority"
                    name="seniority"
                    min="0"
                    value={userData.seniority}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring ${
                      validationErrors.seniority ? 'border-danger-border' : 'border-input'
                    }`}
                    placeholder="0"
                  />
                  {validationErrors.seniority && (
                    <p className="mt-1 text-sm text-danger">{validationErrors.seniority}</p>
                  )}
                </div>

                <div className="space-y-3 pt-6">
                  <div className="flex items-center">
                    <input
                      id="onLeave"
                      name="onLeave"
                      type="checkbox"
                      checked={userData.onLeave}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-primary focus:ring-ring border-input rounded"
                    />
                    <label htmlFor="onLeave" className="ml-2 text-sm font-medium text-muted">
                      Pa permisjon
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="isActive"
                      name="isActive"
                      type="checkbox"
                      checked={userData.isActive}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-primary focus:ring-ring border-input rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 text-sm font-medium text-muted">
                      Aktiv bruker
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="study" className="block text-sm font-medium text-muted mb-1">
                    Studieprogram
                  </label>
                  <select
                    id="study"
                    name="studyId"
                    value={userData.studyId}
                    onChange={handleInputChange}
                    disabled={lookupsLoading}
                    className="w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  >
                    {lookupsLoading ? (
                      <option>Laster studier...</option>
                    ) : (
                      studies.map((study) => (
                        <option key={study.id} value={study.id}>
                          {study.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label htmlFor="studyPlace" className="block text-sm font-medium text-muted mb-1">
                    Studiested
                  </label>
                  <select
                    id="studyPlace"
                    name="schoolId"
                    value={userData.schoolId}
                    onChange={handleInputChange}
                    disabled={lookupsLoading}
                    className="w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  >
                    {lookupsLoading ? (
                      <option>Laster skoler...</option>
                    ) : (
                      schools.map((school) => (
                        <option key={school.id} value={school.id}>
                          {school.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-fg mb-2">Adresse</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      id="address.street"
                      name="address.street"
                      value={userData.address.street}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                      placeholder="Gate"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      id="address.postalCode"
                      name="address.postalCode"
                      value={userData.address.postalCode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                      placeholder="Postnummer"
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <input
                    type="text"
                    id="address.city"
                    name="address.city"
                    value={userData.address.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                    placeholder="By"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                !canSubmit
                  ? 'bg-border-strong text-subtle cursor-not-allowed'
                  : 'bg-primary text-primary-fg hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
              }`}
            >
              {isSubmitting ? 'Legger til...' : 'Legg til bruker'}
            </button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-surface rounded-lg shadow">
        <div className="p-6 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-subtle w-5 h-5" />
              <input
                type="text"
                placeholder="Søk etter navn eller e-post..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
            >
              <option value="all">Alle roller</option>
              {availableRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {usersLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-surface-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-subtle uppercase tracking-wider">
                    Navn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-subtle uppercase tracking-wider">
                    E-post
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-subtle uppercase tracking-wider">
                    Rolle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-subtle uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-subtle uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="bg-surface divide-y divide-border">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-subtle">
                      Ingen brukere funnet.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-surface-muted">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-fg">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-subtle">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-subtle">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-subtle text-primary-subtle-fg">
                          {user.role ?? 'Ingen rolle'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {user.onLeave ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-subtle text-warning-subtle-fg">
                            Permisjon
                          </span>
                        ) : user.isActive ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-subtle text-success-subtle-fg">
                            Aktiv
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-muted text-fg">
                            Inaktiv
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        {user.role !== 'Admin' && user.isActive ? (
                          <button
                            onClick={() => setDeleteConfirm(user)}
                            className="text-subtle hover:text-danger transition-colors"
                            title="Deaktiver bruker"
                            aria-label={`Deaktiver ${user.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-6 py-3 border-t border-border text-sm text-subtle">
          Viser {filteredUsers.length} av {users.length} brukere
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onMouseDown={() => {
            if (!isDeleting) {
              setDeleteConfirm(null);
            }
          }}
          role="presentation"
        >
          <div
            className="bg-surface rounded-lg shadow-xl p-6 max-w-sm mx-4"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <h3 className="text-lg font-medium text-fg mb-2">Deaktiver bruker</h3>
            <p className="text-sm text-muted mb-4">
              Er du sikker på at du vil deaktivere <strong>{deleteConfirm.name}</strong>? Brukeren
              mister innlogging, men historikk beholdes.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-muted bg-surface border border-input rounded-md hover:bg-surface-muted"
              >
                Avbryt
              </button>
              <button
                onClick={() => handleDeleteUser(deleteConfirm)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-danger-fg bg-danger rounded-md hover:bg-danger-hover disabled:opacity-50"
              >
                {isDeleting ? 'Deaktiverer...' : 'Deaktiver'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default AddUserPage;
