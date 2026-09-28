import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { School } from '../../shared/types/school';
import { Study } from '../../shared/types/study';
import { getSchools, getStudies } from '../../server/dao/roomDAO';
import { User } from '../../shared/types/user';
import { getUser } from '../../server/dao/userDAO';

const AboutMePage = () => {
  const { user, loading } = useAuth();
  const [schools, setSchools] = useState<School[]>([]);
  const [studies, setStudies] = useState<Study[]>([]);
  const [userData, setUserData] = useState<User>();

  useEffect(() => {
    (async () => {
      try {
        const [schoolData, studiesData] = await Promise.all([getSchools(), getStudies()]);
        const userDataResponse = user ? await getUser(user.id) : undefined;
        setSchools(schoolData);
        setStudies(studiesData);
        setUserData(userDataResponse);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [user]);

  useEffect(() => {
    console.log(userData);
  }, [userData]);

  if (loading || !user) return null;

  type GeneralInfoType =
    | 'first_name'
    | 'middle_name'
    | 'last_name'
    | 'birth_date'
    | 'email'
    | 'phone_number'
    | 'address'
    | 'postal_code'
    | 'school'
    | 'study'
    | 'year';

  const info: { key: GeneralInfoType; label: string }[] = [
    { key: 'first_name', label: 'Fornavn' },
    { key: 'middle_name', label: 'Mellomnavn' },
    { key: 'last_name', label: 'Etternavn' },
    { key: 'birth_date', label: 'Fødselsdato' },
    { key: 'email', label: 'Epost' },
    { key: 'phone_number', label: 'Telefon' },
    { key: 'address', label: 'Adresse' },
    { key: 'postal_code', label: 'Postkode' },
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
              <p className="text-gray-600 mt-1">Se og rediger personlig informasjon.</p>
            </div>
          </div>
          <div className="bg-white rounded-sm shadow">
            <form onSubmit={(e) => e.preventDefault()}>
              {info.map((info: { key: GeneralInfoType; label: string }) => (
                <div key={info.key}>
                  <label
                    htmlFor={info.label}
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {info.label}
                  </label>
                  {info.key == 'first_name' ? (
                    <input
                      key={info.key}
                      id={info.label}
                      type="text"
                      className="border border-gray-300 rounded-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
                      required
                      value={userData?.name}
                    />
                  ) : info.key == 'birth_date' ? (
                    <input
                      key={info.key}
                      id={info.label}
                      type="date"
                      className="border border-gray-300 rounded-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
                    />
                  ) : info.key == 'email' ? (
                    <input
                      key={info.key}
                      id={info.label}
                      type="email"
                      className="border border-gray-300 rounded-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
                      value={userData?.email}
                    />
                  ) : info.key == 'phone_number' ? (
                    <input
                      key={info.key}
                      id={info.label}
                      type="tel"
                      className="border border-gray-300 rounded-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
                    />
                  ) : info.key == 'postal_code' ? (
                    <input
                      key={info.key}
                      id={info.label}
                      type="number"
                      className="border border-gray-300 rounded-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
                    />
                  ) : info.key == 'year' ? (
                    <input
                      key={info.key}
                      id={info.label}
                      type="number"
                      className="border border-gray-300 rounded-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
                    />
                  ) : info.key == 'school' ? (
                    <select
                      name="school"
                      id={info.key}
                      key={info.key}
                      className="border border-gray-300 rounded-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
                    >
                      {schools.map((school: School) => (
                        <option key={school.id} value={school.id}>
                          {school.name}
                        </option>
                      ))}
                    </select>
                  ) : info.key == 'study' ? (
                    <select
                      name="study"
                      id={info.key}
                      key={info.key}
                      className="border border-gray-300 rounded-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
                    >
                      {studies.map((study: Study) => (
                        <option key={study.id} value={study.id}>
                          {study.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      key={info.key}
                      id={info.label}
                      type="text"
                      className="border border-gray-300 rounded-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
                    />
                  )}
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
