import React from 'react';

type ProfileSectionCardProps = {
  title: string;
  description?: string;
  children?: React.ReactNode;
};

const ProfileSectionCard: React.FC<ProfileSectionCardProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
      </div>
      {children}
    </section>
  );
};

const ProfilePlaceholder: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
      {text}
    </div>
  );
};

const ProfilePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl space-y-6 px-4">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Profil</h1>
          <p className="max-w-3xl text-gray-600">
            Oppdater kontaktinformasjon, kontoopplysninger og personlige innstillinger for
            Internsiden.
          </p>
        </header>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div className="space-y-6">
            <ProfileSectionCard
              title="Generell info"
              description="Navn, kontaktinformasjon og studieopplysninger."
            >
              <ProfilePlaceholder text="Profilskjemaet legges inn i neste steg." />
            </ProfileSectionCard>

            <ProfileSectionCard
              title="Endre passord"
              description="Bytt passordet du bruker for å logge inn."
            >
              <ProfilePlaceholder text="Passordskjemaet legges inn i neste steg." />
            </ProfileSectionCard>
          </div>

          <div className="space-y-6">
            <ProfileSectionCard
              title="Profilbilde"
              description="Visningsbilde og opplasting kommer som egen funksjon."
            >
              <ProfilePlaceholder text="Profilbilde håndteres senere." />
            </ProfileSectionCard>

            <ProfileSectionCard
              title="Preferanser"
              description="Pinkoder og personlige valg fra gamle Internsida."
            >
              <ProfilePlaceholder text="Preferanser kommer senere." />
            </ProfileSectionCard>

            <ProfileSectionCard
              title="Varsler"
              description="Velg hvilke varsler du vil motta."
            >
              <ProfilePlaceholder text="Varslingsinnstillinger kommer senere." />
            </ProfileSectionCard>

            <ProfileSectionCard
              title="E-postlister"
              description="Administrer medlemskap i interne e-postlister."
            >
              <ProfilePlaceholder text="E-postlister kommer senere." />
            </ProfileSectionCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
