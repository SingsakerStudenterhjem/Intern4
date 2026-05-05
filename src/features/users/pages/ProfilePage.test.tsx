import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ProfilePage from './ProfilePage';

const mockUseAuth = vi.fn();
const mockGetUser = vi.fn();
const mockUpdateUser = vi.fn();
const mockGetSchools = vi.fn();
const mockGetStudies = vi.fn();
const mockResetPassword = vi.fn();
const mockRefreshSession = vi.fn();

vi.mock('../../../app/providers/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('../../../server/dao/userDAO', () => ({
  getSchools: (...args: unknown[]) => mockGetSchools(...args),
  getStudies: (...args: unknown[]) => mockGetStudies(...args),
  getUser: (...args: unknown[]) => mockGetUser(...args),
  updateUser: (...args: unknown[]) => mockUpdateUser(...args),
}));

const schools = [
  { id: 'school-annet', name: 'Annet' },
  { id: 'school-ntnu', name: 'NTNU' },
];

const studies = [
  { id: 'study-annet', name: 'Annet' },
  { id: 'study-data', name: 'Datateknologi' },
];

vi.mock('../../../server/dao/authentication', () => ({
  resetPassword: (...args: unknown[]) => mockResetPassword(...args),
}));

vi.mock('../../../server/supabaseClient', () => ({
  supabase: {
    auth: {
      refreshSession: (...args: unknown[]) => mockRefreshSession(...args),
    },
  },
}));

const profile = {
  name: 'Johannes Aamot-Skeidsvoll',
  email: 'johannes@singsaker.no',
  phone: '41177262',
  birthDate: new Date('2005-12-03T00:00:00.000Z'),
  address: {
    street: 'Gimleveien 95',
    postalCode: '7052',
    city: 'Trondheim',
    country: 'Norge',
  },
  schoolId: 'school-ntnu',
  studyId: 'study-data',
  study: 'Datateknologi',
  studyPlace: 'NTNU',
  profilePicture: '',
  seniority: 2,
  roomNumber: 150,
  role: 'Halv/Halv',
  onLeave: false,
  isActive: true,
  createdAt: new Date('2025-01-01T00:00:00.000Z'),
};

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    mockUseAuth.mockReturnValue({
      user: {
        id: '11111111-1111-4111-8111-111111111111',
        name: 'Johannes Aamot-Skeidsvoll',
        email: 'johannes@singsaker.no',
        role: 'Data',
      },
      loading: false,
    });
    mockGetUser.mockResolvedValue(profile);
    mockGetSchools.mockResolvedValue(schools);
    mockGetStudies.mockResolvedValue(studies);
    mockUpdateUser.mockResolvedValue(undefined);
    mockResetPassword.mockResolvedValue({ success: true });
    mockRefreshSession.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads the current profile into split-name fields and keeps email read-only', async () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    expect(await screen.findByDisplayValue('Johannes')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Aamot-Skeidsvoll')).toBeInTheDocument();
    expect(screen.getByDisplayValue('johannes@singsaker.no')).toBeDisabled();
    expect(screen.getByDisplayValue('41177262')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Skole / studiested' })).toHaveValue('school-ntnu');
    expect(screen.getByRole('combobox', { name: 'Studie' })).toHaveValue('study-data');
  });

  it('saves editable profile information with the merged name and current field values', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    const firstName = await screen.findByLabelText('Fornavn');
    await user.clear(firstName);
    await user.type(firstName, 'Johannes');

    const middleName = screen.getByLabelText('Mellomnavn');
    await user.type(middleName, ' Aamot');

    const lastName = screen.getByLabelText('Etternavn');
    await user.clear(lastName);
    await user.type(lastName, 'Skeidsvoll');

    const phone = screen.getByLabelText('Telefon');
    await user.clear(phone);
    await user.type(phone, '42223344');

    const city = screen.getByLabelText('By');
    await user.clear(city);
    await user.type(city, 'Oslo');

    await user.click(screen.getByRole('button', { name: 'Lagre endringer' }));

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith('11111111-1111-4111-8111-111111111111', {
        name: 'Johannes Aamot Skeidsvoll',
        phone: '42223344',
        birthDate: new Date('2005-12-03'),
        address: {
          street: 'Gimleveien 95',
          postalCode: '7052',
          city: 'Oslo',
        },
        schoolId: 'school-ntnu',
        studyId: 'study-data',
      });
    });

    expect(mockRefreshSession).toHaveBeenCalledTimes(1);
    expect(await screen.findByText('Profilen din ble oppdatert.')).toBeInTheDocument();
  });

  it('validates and updates the password through the auth DAO', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    await screen.findByLabelText('Fornavn');

    await user.type(screen.getByLabelText('Nytt passord *'), '123');
    await user.type(screen.getByLabelText('Gjenta passord *'), '1234');
    await user.click(screen.getByRole('button', { name: 'Oppdater passord' }));

    expect(await screen.findByText('Passordet må være minst 6 tegn.')).toBeInTheDocument();
    expect(mockResetPassword).not.toHaveBeenCalled();

    await user.clear(screen.getByLabelText('Nytt passord *'));
    await user.clear(screen.getByLabelText('Gjenta passord *'));
    await user.type(screen.getByLabelText('Nytt passord *'), 'sterktpassord');
    await user.type(screen.getByLabelText('Gjenta passord *'), 'sterktpassord');
    await user.click(screen.getByRole('button', { name: 'Oppdater passord' }));

    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith('sterktpassord');
    });
    expect(await screen.findByText('Passordet ditt ble oppdatert.')).toBeInTheDocument();
  });

  it('renders the planned legacy sections as clear stubs', async () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    await screen.findByLabelText('Fornavn');

    expect(screen.getByRole('heading', { name: 'Profilbilde' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Preferanser' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Varsler' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'E-postlister' })).toBeInTheDocument();
    expect(screen.getAllByText('Kommer senere').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'Last opp bilde' })).toBeDisabled();
  });
});
