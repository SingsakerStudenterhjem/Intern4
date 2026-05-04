import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ResidentDirectoryPage from './residentDirectoryPage';
import { getResidentDirectoryUsers } from '../../../server/dao/userDAO';

vi.mock('../../../server/dao/userDAO', () => ({
  getResidentDirectoryUsers: vi.fn(),
}));

const activeResidents = [
  {
    id: '1',
    name: 'Test Beboer En',
    email: 'test.beboer.en@example.test',
    phone: '40000001',
    birthDate: '2000-01-01',
    study: 'Bioteknologi',
    studyPlace: 'NTNU',
    seniority: 4,
    roomNumber: 101,
    createdAt: '2024-08-15T00:00:00.000Z',
    role: 'Halv/Halv',
    onLeave: false,
    isActive: true,
    address: { street: 'Testgata 1', postalCode: '7000', city: 'Testby' },
  },
  {
    id: '2',
    name: 'Demo Beboer To',
    email: 'demo.beboer.to@example.test',
    phone: '40000002',
    birthDate: null,
    study: 'Fysikk og matematikk',
    studyPlace: 'NTNU',
    seniority: 1,
    roomNumber: 202,
    createdAt: '2026-01-20T00:00:00.000Z',
    role: 'Full Vakt',
    onLeave: false,
    isActive: true,
    address: { street: '', postalCode: '', city: '' },
  },
];

const oldResidents = [
  {
    id: '3',
    name: 'Tidligere Testperson',
    email: '',
    phone: '',
    birthDate: null,
    study: '',
    studyPlace: '',
    seniority: 0,
    roomNumber: null,
    createdAt: '2020-01-01T00:00:00.000Z',
    role: undefined,
    onLeave: false,
    isActive: false,
    address: { street: 'Arkivveien 12', postalCode: '7999', city: '' },
  },
];

const renderPage = (path = '/beboere') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <ResidentDirectoryPage />
    </MemoryRouter>
  );

describe('ResidentDirectoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the active resident list with example columns', async () => {
    vi.mocked(getResidentDirectoryUsers).mockResolvedValue(activeResidents);

    renderPage('/beboere');

    expect(await screen.findByRole('heading', { name: 'Beboerliste' })).toBeInTheDocument();
    expect(getResidentDirectoryUsers).toHaveBeenCalledWith(true);
    expect(screen.getByRole('columnheader', { name: 'Navn' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Rom' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Telefon' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'E-post' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Studie' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Født' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Rolle' })).toBeInTheDocument();
    expect(screen.getByText('Test Beboer En')).toBeInTheDocument();
    expect(screen.getByText('101')).toBeInTheDocument();
    expect(screen.getByText('40000001')).toBeInTheDocument();
    expect(screen.getByText('4. Bioteknologi (NTNU)')).toBeInTheDocument();
  });

  it('filters active residents by search query', async () => {
    const user = userEvent.setup();
    vi.mocked(getResidentDirectoryUsers).mockResolvedValue(activeResidents);

    renderPage('/beboere');

    await screen.findByText('Test Beboer En');
    await user.type(screen.getByPlaceholderText(/søk etter navn/i), 'Fysikk');

    expect(screen.queryByText('Test Beboer En')).not.toBeInTheDocument();
    expect(screen.getByText('Demo Beboer To')).toBeInTheDocument();
  });

  it('renders old residents from inactive users', async () => {
    vi.mocked(getResidentDirectoryUsers).mockResolvedValue(oldResidents);

    renderPage('/beboere/gamle');

    expect(await screen.findByRole('heading', { name: 'Gamle beboere' })).toBeInTheDocument();
    expect(getResidentDirectoryUsers).toHaveBeenCalledWith(false);
    expect(await screen.findByRole('columnheader', { name: 'Adresse' })).toBeInTheDocument();
    expect(await screen.findByRole('columnheader', { name: 'Postnummer' })).toBeInTheDocument();
    expect(screen.getByText('Tidligere Testperson')).toBeInTheDocument();
    expect(screen.getByText('Arkivveien 12')).toBeInTheDocument();
    expect(screen.getByText('7999')).toBeInTheDocument();
  });

  it('renders statistics for active residents', async () => {
    vi.mocked(getResidentDirectoryUsers).mockResolvedValue(activeResidents);

    renderPage('/beboere/statistikk');

    expect(await screen.findByRole('heading', { name: 'Statistikk' })).toBeInTheDocument();
    expect(getResidentDirectoryUsers).toHaveBeenCalledWith(true);
    expect(await screen.findByRole('heading', { name: 'Fødselsår' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Studieår' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Antall semestre på huset' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Studieprogram' })).toBeInTheDocument();
    expect(screen.getByLabelText('2000: 1')).toBeInTheDocument();
    expect(screen.getAllByLabelText('1: 1').length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText('4: 1').length).toBeGreaterThan(0);
    expect(screen.getByLabelText('Bioteknologi: 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Fysikk og matematikk: 1')).toBeInTheDocument();
    expect(screen.queryByLabelText('Maskin: 0')).not.toBeInTheDocument();
  });

  it('shows loading, error, and empty states', async () => {
    vi.mocked(getResidentDirectoryUsers).mockImplementationOnce(() => new Promise(() => undefined));

    const { unmount } = renderPage('/beboere');

    expect(screen.getByLabelText('Laster beboere')).toBeInTheDocument();
    unmount();

    vi.mocked(getResidentDirectoryUsers).mockRejectedValueOnce(new Error('Nope'));
    renderPage('/beboere');

    expect(await screen.findByText('Kunne ikke laste beboere.')).toBeInTheDocument();

    vi.mocked(getResidentDirectoryUsers).mockResolvedValueOnce([]);
    renderPage('/beboere/gamle');

    await waitFor(() => {
      expect(screen.getByText('Ingen gamle beboere funnet.')).toBeInTheDocument();
    });
  });
});
