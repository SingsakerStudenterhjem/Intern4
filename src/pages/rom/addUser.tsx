import React, { useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import { addNewUser } from '../../backend/src/authentication';
import { Application } from '../../backend/types/application';

const AddUser: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    gender: '',
    address: {
      street: '',
      postalCode: '',
      city: '',
    },
    study: '',
    studyPlace: '',
    roomNumber: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  const validateField = (name: string, value: string) => {
    const errors: { [key: string]: string } = {};

    if (name === 'phone' && value) {
      const phoneRegex = /^(\+47)?[0-9\s]{8,}$/;
      if (!phoneRegex.test(value.replace(/\s/g, ''))) {
        errors.phone = 'Ugyldig telefonnummer format';
      }
    }

    if (name === 'roomNumber' && value) {
      const roomNum = parseInt(value);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    const fieldErrors = validateField(name, value);
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
    Object.entries(formData).forEach(([key, value]) => {
      if (typeof value === 'string') {
        const fieldErrors = validateField(key, value);
        Object.assign(allErrors, fieldErrors);
      }
    });

    if (Object.values(allErrors).some((error) => error)) {
      setValidationErrors(allErrors);
      setMessage({ type: 'error', text: 'Vennligst rett feilene i skjemaet' });
      setIsSubmitting(false);
      return;
    }

    try {
      const application: Application = {
        applicationId: `temp-${Date.now()}`,
        status: 'Godkjent',
        name: formData.name,
        email: formData.email,
        phone: formData.phone || '',
        birthDate: formData.birthDate
          ? Timestamp.fromDate(new Date(formData.birthDate))
          : Timestamp.now(),
        gender: formData.gender || '',
        address: {
          street: formData.address.street || '',
          postalCode: formData.address.postalCode || '',
          city: formData.address.city || '',
        },
        study: formData.study || '',
        studyPlace: formData.studyPlace || '',
        profilePicture: '',
        certificate: '',
        skills: '',
        knowsAboutSing: '',
        knowsResidents: '',
        applicationText: '',
        applicationDate: Timestamp.now(),
      };

      const result = await addNewUser(
        application,
        formData.roomNumber ? parseInt(formData.roomNumber) : undefined
      );

      if (result.success) {
        setMessage({ type: 'success', text: 'Beboer lagt til successfully!' });
        setFormData({
          name: '',
          email: '',
          phone: '',
          birthDate: '',
          gender: '',
          address: { street: '', postalCode: '', city: '' },
          study: '',
          studyPlace: '',
          roomNumber: '',
        });
        setValidationErrors({});
        setShowOptionalFields(false);
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
          className={`mb-4 p-4 rounded-md ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
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
                value={formData.name}
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
                value={formData.email}
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
                  value={formData.phone}
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
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                  Kjønn
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Velg kjønn</option>
                  <option value="Mann">Mann</option>
                  <option value="Kvinne">Kvinne</option>
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
                  type="text"
                  id="roomNumber"
                  name="roomNumber"
                  value={formData.roomNumber}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="study" className="block text-sm font-medium text-gray-700 mb-1">
                  Studieprogram
                </label>
                <input
                  type="text"
                  id="study"
                  name="study"
                  value={formData.study}
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
                  value={formData.studyPlace}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="NTNU"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.name.trim() || !formData.email.trim()}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              isSubmitting || !formData.name.trim() || !formData.email.trim()
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
