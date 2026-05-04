import React, { useEffect, useMemo, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/authContext';
import { supabase } from '../../server/supabaseClient';
import { getSchools, getStudies, getUser, updateUser } from '../../server/dao/userDAO';
import { resetPassword } from '../../server/dao/authentication';
import { getDefaultLookupId, LookupOption } from '../../shared/types/lookup';
import { normalizePhoneNumber, validatePhoneNumber } from '../../shared/utils/phone';

type GeneralInfoFormState = {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  street: string;
  postalCode: string;
  city: string;
  schoolId: string;
  studyId: string;
};

type ProfileSectionCardProps = {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
};

const ProfileSectionCard: React.FC<ProfileSectionCardProps> = ({
  title,
  description,
  children,
  className = '',
}) => {
  return (
    <section className={`rounded-xl border border-gray-200 bg-white p-4 shadow-sm ${className}`}>
      <div className="mb-2.5">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
      </div>
      {children}
    </section>
  );
};

const StubBadge: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
      {children}
    </span>
  );
};

const emptyGeneralInfoForm = (): GeneralInfoFormState => ({
  firstName: '',
  middleName: '',
  lastName: '',
  email: '',
  phone: '',
  birthDate: '',
  street: '',
  postalCode: '',
  city: '',
  schoolId: '',
  studyId: '',
});

const splitFullName = (
  fullName?: string
): Pick<GeneralInfoFormState, 'firstName' | 'middleName' | 'lastName'> => {
  const parts = fullName?.trim().split(/\s+/).filter(Boolean) ?? [];

  if (parts.length === 0) {
    return { firstName: '', middleName: '', lastName: '' };
  }

  if (parts.length === 1) {
    return { firstName: parts[0], middleName: '', lastName: '' };
  }

  if (parts.length === 2) {
    return { firstName: parts[0], middleName: '', lastName: parts[1] };
  }

  return {
    firstName: parts[0],
    middleName: parts.slice(1, -1).join(' '),
    lastName: parts[parts.length - 1],
  };
};

const mergeFullName = ({
  firstName,
  middleName,
  lastName,
}: Pick<GeneralInfoFormState, 'firstName' | 'middleName' | 'lastName'>): string =>
  [firstName, middleName, lastName]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(' ');

const formatDateForInput = (value: unknown): string => {
  if (!value) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'string') return value.slice(0, 10);
  return '';
};

const FieldLabel: React.FC<{ htmlFor: string; children: React.ReactNode; required?: boolean }> = ({
  htmlFor,
  children,
  required = false,
}) => {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-gray-700">
      {children}
      {required && <span className="text-red-500"> *</span>}
    </label>
  );
};

const TextInput: React.FC<
  React.InputHTMLAttributes<HTMLInputElement> & {
    error?: string;
  }
> = ({ error, className = '', ...props }) => {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border px-3.5 py-3 text-sm shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        error ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-blue-500'
      } ${className}`}
    />
  );
};

const SelectInput: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <select
      {...props}
      className={`w-full rounded-xl border border-gray-200 px-3.5 py-3 text-sm shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    >
      {children}
    </select>
  );
};

const ProfilePage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [profileLoading, setProfileLoading] = useState(true);
  const [form, setForm] = useState<GeneralInfoFormState>(emptyGeneralInfoForm());
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [savingGeneralInfo, setSavingGeneralInfo] = useState(false);
  const [schools, setSchools] = useState<LookupOption[]>([]);
  const [studies, setStudies] = useState<LookupOption[]>([]);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) {
        setProfileLoading(false);
        return;
      }

      try {
        setProfileLoading(true);
        setFormError(null);
        const [profile, schoolOptions, studyOptions] = await Promise.all([
          getUser(user.id),
          getSchools(),
          getStudies(),
        ]);

        if (!profile) {
          setFormError('Kunne ikke finne profilen din.');
          setProfileLoading(false);
          return;
        }

        setSchools(schoolOptions);
        setStudies(studyOptions);

        const nameParts = splitFullName(profile.name);

        setForm({
          firstName: nameParts.firstName,
          middleName: nameParts.middleName,
          lastName: nameParts.lastName,
          email: profile.email ?? user.email ?? '',
          phone: profile.phone ?? '',
          birthDate: formatDateForInput(profile.birthDate),
          street: profile.address?.street ?? '',
          postalCode: profile.address?.postalCode ?? '',
          city: profile.address?.city ?? '',
          schoolId: profile.schoolId ?? getDefaultLookupId(schoolOptions),
          studyId: profile.studyId ?? getDefaultLookupId(studyOptions),
        });
      } catch (error) {
        console.error(error);
        setFormError('Kunne ikke laste profilinformasjon.');
      } finally {
        setProfileLoading(false);
      }
    };

    if (authLoading) return;
    void loadProfile();
  }, [authLoading, user]);

  const fullName = useMemo(
    () =>
      mergeFullName({
        firstName: form.firstName,
        middleName: form.middleName,
        lastName: form.lastName,
      }),
    [form.firstName, form.lastName, form.middleName]
  );

  const setField = (field: keyof GeneralInfoFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFormError(null);
    setFormSuccess(null);
  };

  const handleGeneralInfoSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user?.id) return;

    if (!fullName) {
      setFormError('Navn kan ikke være tomt.');
      return;
    }

    const normalizedPhone = normalizePhoneNumber(form.phone);
    const phoneError = validatePhoneNumber(normalizedPhone);
    if (phoneError) {
      setFormError(phoneError);
      return;
    }

    try {
      setSavingGeneralInfo(true);
      setFormError(null);
      setFormSuccess(null);

      await updateUser(user.id, {
        name: fullName,
        phone: normalizedPhone,
        birthDate: form.birthDate ? new Date(form.birthDate) : undefined,
        address: {
          street: form.street.trim(),
          postalCode: form.postalCode.trim(),
          city: form.city.trim(),
        },
        schoolId: form.schoolId || undefined,
        studyId: form.studyId || undefined,
      });

      await supabase.auth.refreshSession();
      setFormSuccess('Profilen din ble oppdatert.');
    } catch (error) {
      console.error(error);
      setFormError('Kunne ikke lagre profilinformasjon.');
    } finally {
      setSavingGeneralInfo(false);
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 6) {
      setPasswordError('Passordet må være minst 6 tegn.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passordene stemmer ikke overens.');
      return;
    }

    try {
      setSavingPassword(true);
      const result = await resetPassword(newPassword);

      if (!result.success) {
        setPasswordError(result.error);
        return;
      }

      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccess('Passordet ditt ble oppdatert.');
    } catch (error) {
      console.error(error);
      setPasswordError('Kunne ikke oppdatere passordet.');
    } finally {
      setSavingPassword(false);
    }
  };

  if (authLoading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl space-y-4 px-4">
        <header className="space-y-1.5">
          <h1 className="text-3xl font-bold text-gray-900">Profil</h1>
          <p className="max-w-3xl text-gray-600">
            Oppdater kontaktinformasjon, kontoopplysninger og personlige innstillinger for
            Internsiden.
          </p>
        </header>

        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(21rem,0.95fr)]">
          <div className="space-y-4">
            <ProfileSectionCard
              title="Generell info"
              description="Navn, kontaktinformasjon og studieopplysninger."
            >
              {profileLoading ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
                  Laster profilinformasjon...
                </div>
              ) : (
                <form className="space-y-2.5" onSubmit={handleGeneralInfoSubmit}>
                  <div className="grid gap-x-3 gap-y-2.5 md:grid-cols-3">
                    <div>
                      <FieldLabel htmlFor="firstName">Fornavn</FieldLabel>
                      <TextInput
                        id="firstName"
                        value={form.firstName}
                        onChange={(event) => setField('firstName', event.target.value)}
                        placeholder="Fornavn"
                      />
                    </div>
                    <div>
                      <FieldLabel htmlFor="middleName">Mellomnavn</FieldLabel>
                      <TextInput
                        id="middleName"
                        value={form.middleName}
                        onChange={(event) => setField('middleName', event.target.value)}
                        placeholder="Mellomnavn"
                      />
                    </div>
                    <div>
                      <FieldLabel htmlFor="lastName">Etternavn</FieldLabel>
                      <TextInput
                        id="lastName"
                        value={form.lastName}
                        onChange={(event) => setField('lastName', event.target.value)}
                        placeholder="Etternavn"
                      />
                    </div>
                  </div>

                  <div className="grid gap-x-3 gap-y-2.5 md:grid-cols-6">
                    <div className="md:col-span-2">
                      <FieldLabel htmlFor="email">E-post</FieldLabel>
                      <TextInput
                        id="email"
                        value={form.email}
                        readOnly
                        disabled
                        className="bg-gray-50 text-gray-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">E-post kan ikke endres her ennå.</p>
                    </div>
                    <div className="md:col-span-2">
                      <FieldLabel htmlFor="phone">Telefon</FieldLabel>
                      <TextInput
                        id="phone"
                        value={form.phone}
                        onChange={(event) => setField('phone', event.target.value)}
                        placeholder="Telefonnummer"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <FieldLabel htmlFor="birthDate">Fødselsdato</FieldLabel>
                      <TextInput
                        id="birthDate"
                        type="date"
                        value={form.birthDate}
                        onChange={(event) => setField('birthDate', event.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-x-3 gap-y-2.5 md:grid-cols-6">
                    <div className="md:col-span-3">
                      <FieldLabel htmlFor="street">Adresse</FieldLabel>
                      <TextInput
                        id="street"
                        value={form.street}
                        onChange={(event) => setField('street', event.target.value)}
                        placeholder="Gateadresse"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <FieldLabel htmlFor="postalCode">Postnummer</FieldLabel>
                      <TextInput
                        id="postalCode"
                        value={form.postalCode}
                        onChange={(event) => setField('postalCode', event.target.value)}
                        placeholder="Postnr"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <FieldLabel htmlFor="city">By</FieldLabel>
                      <TextInput
                        id="city"
                        value={form.city}
                        onChange={(event) => setField('city', event.target.value)}
                        placeholder="By"
                      />
                    </div>
                  </div>

                  <div className="grid gap-x-3 gap-y-2.5 md:grid-cols-6">
                    <div className="md:col-span-2">
                      <FieldLabel htmlFor="studyPlace">Skole / studiested</FieldLabel>
                      <SelectInput
                        id="studyPlace"
                        value={form.schoolId}
                        onChange={(event) => setField('schoolId', event.target.value)}
                        disabled={savingGeneralInfo || profileLoading}
                      >
                        {schools.map((school) => (
                          <option key={school.id} value={school.id}>
                            {school.name}
                          </option>
                        ))}
                      </SelectInput>
                    </div>
                    <div className="md:col-span-2">
                      <FieldLabel htmlFor="study">Studie</FieldLabel>
                      <SelectInput
                        id="study"
                        value={form.studyId}
                        onChange={(event) => setField('studyId', event.target.value)}
                        disabled={savingGeneralInfo || profileLoading}
                      >
                        {studies.map((study) => (
                          <option key={study.id} value={study.id}>
                            {study.name}
                          </option>
                        ))}
                      </SelectInput>
                    </div>
                    <div className="flex items-end md:col-span-2 md:justify-end">
                      <button
                        type="submit"
                        disabled={savingGeneralInfo || profileLoading}
                        className="inline-flex min-w-42 items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {savingGeneralInfo ? 'Lagrer...' : 'Lagre endringer'}
                      </button>
                    </div>
                  </div>

                  {formError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {formError}
                    </div>
                  )}

                  {formSuccess && (
                    <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                      {formSuccess}
                    </div>
                  )}
                </form>
              )}
            </ProfileSectionCard>

            <ProfileSectionCard
              title="Endre passord"
              description="Bytt passordet du bruker for å logge inn."
            >
              <form className="space-y-2.5" onSubmit={handlePasswordSubmit}>
                <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-900">
                  Bruk et sterkt passord. Dagens innloggingsflyt krever minst 6 tegn.
                </div>

                <div className="grid gap-y-2.5">
                  <div>
                    <FieldLabel htmlFor="newPassword" required>
                      Nytt passord
                    </FieldLabel>
                    <div className="relative">
                      <TextInput
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(event) => {
                          setNewPassword(event.target.value);
                          setPasswordError(null);
                          setPasswordSuccess(null);
                        }}
                        placeholder="Nytt passord"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((value) => !value)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        aria-label={showNewPassword ? 'Skjul nytt passord' : 'Vis nytt passord'}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <FieldLabel htmlFor="confirmPassword" required>
                      Gjenta passord
                    </FieldLabel>
                    <div className="relative">
                      <TextInput
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(event) => {
                          setConfirmPassword(event.target.value);
                          setPasswordError(null);
                          setPasswordSuccess(null);
                        }}
                        placeholder="Gjenta passord"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((value) => !value)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        aria-label={
                          showConfirmPassword ? 'Skjul bekreftet passord' : 'Vis bekreftet passord'
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={savingPassword || !newPassword || !confirmPassword}
                      className="inline-flex min-w-42 items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {savingPassword ? 'Oppdaterer...' : 'Oppdater passord'}
                    </button>
                  </div>
                </div>

                {passwordError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {passwordError}
                  </div>
                )}

                {passwordSuccess && (
                  <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {passwordSuccess}
                  </div>
                )}
              </form>
            </ProfileSectionCard>
          </div>

          <div className="space-y-4">
            <ProfileSectionCard
              title="Profilbilde"
              description="Visningsbilde og opplasting kommer som egen funksjon."
            >
              <div className="space-y-2.5">
                <div className="h-32 overflow-hidden rounded-xl border border-gray-200 bg-linear-to-br from-gray-50 to-gray-100">
                  <div className="flex h-full items-center justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-lg font-semibold text-gray-400 shadow-sm">
                      {fullName
                        .split(' ')
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((part) => part[0]?.toUpperCase())
                        .join('') || 'PI'}
                    </div>
                  </div>
                </div>
                <StubBadge>Kommer senere</StubBadge>
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3 text-sm text-gray-500">
                  Opplasting av profilbilde blir lagt til i en senere iterasjon.
                </div>
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm font-medium text-gray-500 opacity-80"
                >
                  Last opp bilde
                </button>
              </div>
            </ProfileSectionCard>

            <ProfileSectionCard
              title="Preferanser"
              description="Pinkoder og personlige valg fra gamle Internsida."
            >
              <div className="space-y-2.5">
                <StubBadge>Kommer senere</StubBadge>
                <div className="space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-3.5">
                  <label className="flex items-center justify-between gap-3 text-sm text-gray-600">
                    <span>Stå på krysselista i resepsjonen</span>
                    <input type="checkbox" disabled className="h-4 w-4 rounded border-gray-300" />
                  </label>
                  <label className="flex items-center justify-between gap-3 text-sm text-gray-600">
                    <span>Stå på krysselista i vinkjelleren</span>
                    <input type="checkbox" disabled className="h-4 w-4 rounded border-gray-300" />
                  </label>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    <div className="min-w-0">
                      <FieldLabel htmlFor="pinStub">Pinkode</FieldLabel>
                      <TextInput
                        id="pinStub"
                        value="1234"
                        readOnly
                        disabled
                        className="bg-white text-gray-400"
                      />
                    </div>
                    <div className="min-w-0">
                      <FieldLabel htmlFor="winePinStub">Pinkode til vinkjeller</FieldLabel>
                      <TextInput
                        id="winePinStub"
                        value="1234"
                        readOnly
                        disabled
                        className="bg-white text-gray-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </ProfileSectionCard>

            <ProfileSectionCard title="Varsler" description="Velg hvilke varsler du vil motta.">
              <div className="space-y-2.5">
                <StubBadge>Kommer senere</StubBadge>
                <div className="space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-3.5">
                  {[
                    'Når du har blitt tildelt en vakt',
                    'Når det er 24 timer igjen til å sitte vakt',
                    'Når noen vil bytte eller gi bort en vakt',
                    'Når kosesjef har planlagt et utleie',
                  ].map((label) => (
                    <label
                      key={label}
                      className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-3 text-sm text-gray-600"
                    >
                      <span>{label}</span>
                      <input type="checkbox" disabled className="h-4 w-4 rounded border-gray-300" />
                    </label>
                  ))}
                </div>
              </div>
            </ProfileSectionCard>

            <ProfileSectionCard
              title="E-postlister"
              description="Administrer medlemskap i interne e-postlister."
            >
              <div className="space-y-2.5">
                <StubBadge>Kommer senere</StubBadge>
                <div className="overflow-hidden rounded-xl border border-gray-200">
                  <div className="grid grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,0.7fr))] bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <div className="px-3 py-3">E-post</div>
                    <div className="px-3 py-3">Alle</div>
                    <div className="px-3 py-3">Gutter</div>
                    <div className="px-3 py-3">Slå av</div>
                  </div>
                  <div className="grid grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,0.7fr))] items-center bg-white text-sm text-gray-600">
                    <div className="px-3 py-3">{form.email || user?.email || 'Din e-post'}</div>
                    <div className="px-3 py-3">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-700">
                        ✓
                      </span>
                    </div>
                    <div className="px-3 py-3">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-700">
                        ✓
                      </span>
                    </div>
                    <div className="px-3 py-3">
                      <button
                        type="button"
                        disabled
                        className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-medium text-gray-500"
                      >
                        Fjern
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </ProfileSectionCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
