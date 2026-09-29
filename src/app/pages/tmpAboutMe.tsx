import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { User } from '../../shared/types/user';
import { getUser } from '../../server/dao/userDAO';

const AboutMePage = () => {
  const { user, loading } = useAuth();
  const [userData, setUserData] = useState<User>();
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    birthDate: undefined,
    email: '',
    phone: '',
    study: '',
    studyPlace: '',
  });

  useEffect(() => {
    (async () => {
      try {
        const userDataResponse = user ? await getUser(user.id) : undefined;
        setUserData(userDataResponse);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [user]);

  useEffect(() => {
    if (userData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: userData.name,
        birthDate: userData.birthDate,
        email: userData.email,
        phone: userData.phone,
        study: userData.study,
        studyPlace: userData.studyPlace,
      });
    }
  }, [userData]);

  if (loading || !user) return null;

  type GeneralInfoType =
    | 'first_name'
    | 'birth_date'
    | 'email'
    | 'phone_number'
    | 'school'
    | 'study'
    | 'year';

  const info: { key: GeneralInfoType; label: string }[] = [
    { key: 'first_name', label: 'Navn' },
    { key: 'birth_date', label: 'Fødselsdato' },
    { key: 'email', label: 'Epost' },
    { key: 'phone_number', label: 'Telefon' },
    { key: 'school', label: 'Skole' },
    { key: 'study', label: 'Studie' },
    { key: 'year', label: 'Klassetrinn' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Profil</h1>
              <p className="text-gray-600 mt-1">
                Se og rediger personlig informasjon. OBS! Redigering er ikke implementert enda.
              </p>
            </div>
          </div>
          <div className="bg-white rounded-sm shadow p-5">
            <form onSubmit={(e) => e.preventDefault()}>
              {Object.values(formData).map((data, index) => (
                <div key={index}>
                  <label
                    htmlFor={info[index].label}
                    className="block text-sm font-medium text-gray-900 mb-2"
                  >
                    {info[index].label}
                  </label>
                  <input
                    key={index}
                    id={info[index].label}
                    type="text"
                    className="border border-gray-300 rounded-sm px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
                    value={data?.toString() ?? ''}
                    disabled
                  />
                </div>
              ))}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutMePage;
