import React, { useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import { addNewUser } from '../../backend/src/authentication';
import { User } from '../../backend/types/user';

const AddUser: React.FC = () => {
  const [userData, setUserData] = useState<Omit<User, 'createdAt' | 'lastLogin'>>({
    name: '',
    email: '',
    phone: '',
    birthDate: Timestamp.now(),
    address: {
      street: '',
      postalCode: 0,
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
          birthDate: Timestamp.fromDate(new Date(value)),
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

  const handleArrayChange = (field: 'leadershipRoles' | 'tasks', value: string) => {
    const items = value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item !== '');
    setUserData((prev) => ({
      ...prev,
      [field]: items,
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
      const result = await addNewUser(userData);

      if (result.success) {
        setMessage({ type: 'success', text: `✓ ${userData.name} ble lagt til som beboer` });
        setUserData({
          name: '',
          email: '',
          phone: '',
          birthDate: Timestamp.now(),
          address: { street: '', postalCode: 0, city: '' },
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

        setTimeout(() => {
          setMessage(null);
        }, 4000);
      } else {
        setMessage({ type: 'error', text: result.error || 'En feil oppstod' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'En feil oppstod ved oppretting av bruker' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Legg til bruker</h1>
      </div>

      {message && (
        <div
          className={`mb-4 p-3 rounded-md text-sm transition-all duration-300 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Obligatoriske felter</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowOptionalFields(!showOptionalFields)}
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            {showOptionalFields ? '− Skjul valgfrie felter' : '+ Vis valgfrie felter'}
          </button>
        </div>

        {showOptionalFields && (
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Valgfrie felter</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
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
                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Fødselsdato
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
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Rolle
                </label>
                <select
                  id="role"
                  name="role"
                  value={userData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Halv/Halv">Halv/Halv</option>
                  <option value="Full Regi">Full Regi</option>
                  <option value="Full Vakt">Full Vakt</option>
                  <option value="Utvalgsmedlem">Utvalgsmedlem</option>
                  <option value="Daglig leder">Daglig leder</option>
                </select>
              </div>

              <div>
                <label htmlFor="seniority" className="block text-sm font-medium text-gray-700 mb-1">
                  Ansiennitet (år)
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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

              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="flex items-center h-5">
                    <input
                      id="onLeave"
                      name="onLeave"
                      type="checkbox"
                      checked={userData.onLeave}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3">
                    <label htmlFor="onLeave" className="text-sm font-medium text-gray-700">
                      På permisjon
                    </label>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="flex items-center h-5">
                    <input
                      id="isActive"
                      name="isActive"
                      type="checkbox"
                      checked={userData.isActive}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3">
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                      Aktiv bruker
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="study" className="block text-sm font-medium text-gray-700 mb-1">
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

            <div className="mb-4">
              <h4 className="text-md font-medium text-gray-900 mb-2">Adresse</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label
                    htmlFor="address.street"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Gate
                  </label>
                  <input
                    type="text"
                    id="address.street"
                    name="address.street"
                    value={userData.address.street}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Storgata 1"
                  />
                </div>
                <div>
                  <label
                    htmlFor="address.postalCode"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Postnummer
                  </label>
                  <input
                    type="text"
                    id="address.postalCode"
                    name="address.postalCode"
                    value={userData.address.postalCode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0123"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label
                  htmlFor="address.city"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  By
                </label>
                <input
                  type="text"
                  id="address.city"
                  name="address.city"
                  value={userData.address.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Oslo"
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
            {isSubmitting ? 'Legger til...' : 'Legg til beboer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddUser;
