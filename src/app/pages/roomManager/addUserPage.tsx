import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { NewUserInput } from '../../../shared/types/user';
import {
  createUser,
  getRoles,
  getAllUsersWithRole,
  Role,
  BasicUserWithRole,
} from '../../../server/dao/userDAO';

const AddUserPage: React.FC = () => {
  const [userData, setUserData] = useState<NewUserInput>({
    name: '',
    email: '',
    phone: '',
    birthDate: new Date(),
    address: {
      street: '',
      postalCode: '',
      city: '',
    },
    study: '',
    studyPlace: '',
    profilePicture: '',
    seniority: 0,
    roomNumber: 0,
    role: 'Halv/Halv',
    onLeave: false,
    isActive: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [birthDateString, setBirthDateString] = useState('');
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);

  // User list state
  const [users, setUsers] = useState<BasicUserWithRole[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    getRoles()
      .then((data) => setRoles(data))
      .catch((err) => console.error('Failed to load roles:', err))
      .finally(() => setRolesLoading(false));
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      const data = await getAllUsersWithRole();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const availableRoles = Array.from(new Set(users.map((u) => u.role).filter(Boolean))).sort();

  const filteredUsers = users.filter((u) => {
    const matchesQuery =
      !query ||
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesQuery && matchesRole;
  });

  const validateField = (name: string, value: any) => {
    const errors: { [key: string]: string } = {};

    if (name === 'phone' && value) {
      const phoneRegex = /^(\+47)?[0-9\s]{8,}$/;
      if (!phoneRegex.test(value.replace(/\s/g, ''))) {
        errors.phone = 'Ugyldig telefonnummer format';
      }
    }

    if (name === 'seniority' && value !== undefined) {
      const seniorityNum = typeof value === 'string' ? parseInt(value) : value;
      if (isNaN(seniorityNum) || seniorityNum < 0) {
        errors.seniority = 'Ansiennitet må være et positivt tall';
      }
    }

    if (name === 'roomNumber' && value) {
      const roomNum = typeof value === 'string' ? parseInt(value) : value;
      if (isNaN(roomNum)) {
        errors.roomNumber = 'Romnummer må være et tall';
      } else if (
        roomNum !== 60 &&
        roomNum !== 0 &&
        !(roomNum >= 100 && roomNum <= 173) &&
        !(roomNum >= 200 && roomNum <= 273)
      ) {
        errors.roomNumber = 'Romnummer må være 060, 0, mellom 100-173, eller mellom 200-273';
      }
    }

    return errors;
  };

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
      const [parent, child] = name.split('.');
      setUserData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value,
        },
      }));
    } else {
      let processedValue: any = value;

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

    const fieldErrors = validateField(
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

    const allErrors: { [key: string]: string } = {};
    Object.entries(userData).forEach(([key, value]) => {
      const fieldErrors = validateField(key, value);
      Object.assign(allErrors, fieldErrors);
    });

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

    try {
      const { initialPassword } = await createUser(userData);

      setMessage({
        type: 'success',
        text:
          `${userData.name} ble lagt til` +
          (initialPassword ? ` (midlertidig passord: ${initialPassword})` : ''),
      });

      setUserData({
        name: '',
        email: '',
        phone: '',
        birthDate: new Date(),
        address: { street: '', postalCode: '', city: '' },
        study: '',
        studyPlace: '',
        profilePicture: '',
        seniority: 0,
        roomNumber: 0,
        role: 'Halv/Halv',
        onLeave: false,
        isActive: true,
      });
      setBirthDateString('');
      setValidationErrors({});
      setShowOptionalFields(false);
      setShowAddForm(false);
      await loadUsers();

      setTimeout(() => {
        setMessage(null);
      }, 4000);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error?.message ?? 'En feil oppstod ved oppretting av bruker',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Administrer brukere</h1>
              <p className="text-gray-600 mt-1">Oversikt over brukere og opprett nye.</p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {showAddForm ? 'Skjul skjema' : 'Legg til bruker'}
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`mb-6 p-3 rounded-md text-sm transition-all duration-300 ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Add User Form */}
        {showAddForm && (
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Ny bruker</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Navn *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={userData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Skriv inn fullt navn"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  E-post *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={userData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="navn@eksempel.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Rolle
                </label>
                <select
                  id="role"
                  name="role"
                  value={userData.role}
                  onChange={handleInputChange}
                  disabled={rolesLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <label
                  htmlFor="roomNumber"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Romnummer
                </label>
                <input
                  type="number"
                  id="roomNumber"
                  name="roomNumber"
                  min="0"
                  value={userData.roomNumber}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    validationErrors.roomNumber ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="260"
                />
                {validationErrors.roomNumber && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.roomNumber}</p>
                )}
              </div>
            </div>

            <div className="mb-4">
              <button
                type="button"
                onClick={() => setShowOptionalFields(!showOptionalFields)}
                className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                {showOptionalFields ? '− Skjul valgfrie felter' : '+ Vis valgfrie felter'}
              </button>
            </div>

            {showOptionalFields && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Telefon
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={userData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.phone ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="+47 123 45 678"
                    />
                    {validationErrors.phone && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="birthDate"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Fodselsdato
                    </label>
                    <input
                      type="date"
                      id="birthDate"
                      name="birthDate"
                      value={birthDateString}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label
                      htmlFor="seniority"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Ansiennitet (ar)
                    </label>
                    <input
                      type="number"
                      id="seniority"
                      name="seniority"
                      min="0"
                      value={userData.seniority}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.seniority ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="0"
                    />
                    {validationErrors.seniority && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.seniority}</p>
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
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="onLeave" className="ml-2 text-sm font-medium text-gray-700">
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
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
                        Aktiv bruker
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label
                      htmlFor="study"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Studieprogram
                    </label>
                    <input
                      type="text"
                      id="study"
                      name="study"
                      value={userData.study}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Dataingeniør"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="studyPlace"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Studiested
                    </label>
                    <input
                      type="text"
                      id="studyPlace"
                      name="studyPlace"
                      value={userData.studyPlace}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="NTNU"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Adresse</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        id="address.street"
                        name="address.street"
                        value={userData.address.street}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="By"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !userData.name.trim() || !userData.email.trim()}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  isSubmitting || !userData.name.trim() || !userData.email.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                }`}
              >
                {isSubmitting ? 'Legger til...' : 'Legg til bruker'}
              </button>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Sok etter navn eller e-post..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Navn
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      E-post
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rolle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        Ingen brukere funnet.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {user.role ?? 'Ingen rolle'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {user.onLeave ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Permisjon
                            </span>
                          ) : user.isActive ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Aktiv
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Inaktiv
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          <div className="px-6 py-3 border-t border-gray-200 text-sm text-gray-500">
            Viser {filteredUsers.length} av {users.length} brukere
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUserPage;
