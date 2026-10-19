import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AddUserPage from './AddUserPage';

const mockCreateUser = vi.fn();
const mockDeleteUser = vi.fn();
const mockGetRoles = vi.fn();
const mockGetAllUsersWithRole = vi.fn();
const mockGetSchools = vi.fn();
const mockGetStudies = vi.fn();

vi.mock('../../../server/dao/userDAO', () => ({
  createUser: (...args: unknown[]) => mockCreateUser(...args),
  deleteUser: (...args: unknown[]) => mockDeleteUser(...args),
  getRoles: (...args: unknown[]) => mockGetRoles(...args),
  getAllUsersWithRole: (...args: unknown[]) => mockGetAllUsersWithRole(...args),
  getSchools: (...args: unknown[]) => mockGetSchools(...args),
  getStudies: (...args: unknown[]) => mockGetStudies(...args),
}));

const existingUsers = [
  {
    id: 'u1',
    name: 'Kari Beboer',
    email: 'kari@example.test',
    role: 'Halv/Halv',
    isActive: true,
    onLeave: false,
  },
  {
    id: 'u2',
    name: 'Admin Person',
    email: 'admin@example.test',
    role: 'Admin',
    isActive: true,
    onLeave: false,
  },
];

const openForm = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: 'Ny bruker' }));
  return screen.getByRole('dialog', { name: 'Ny bruker' });
};

describe('AddUserPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    mockGetRoles.mockResolvedValue([{ id: 'role-halv', name: 'Halv/Halv' }]);
    mockGetAllUsersWithRole.mockResolvedValue(existingUsers);
    mockGetSchools.mockResolvedValue([
      { id: 'school-annet', name: 'Annet' },
      { id: 'school-ntnu', name: 'NTNU' },
    ]);
    mockGetStudies.mockResolvedValue([
      { id: 'study-annet', name: 'Annet' },
      { id: 'study-data', name: 'Datateknologi' },
    ]);
    mockCreateUser.mockResolvedValue({
      id: '11111111-1111-1111-1111-111111111111',
      initialPassword: 'abc123',
    });
  });

  it('submits selected lookup ids and keeps the temporary password visible', async () => {
    const user = userEvent.setup();
    render(<AddUserPage />);

    const form = await openForm(user);
    await user.type(within(form).getByLabelText(/^navn/i), 'Test Beboer');
    await user.type(within(form).getByLabelText(/^e-post/i), 'test@example.test');
    await user.selectOptions(await within(form).findByLabelText('Studiested'), 'school-ntnu');
    await user.selectOptions(within(form).getByLabelText('Studieprogram'), 'study-data');
    await user.click(screen.getByRole('button', { name: 'Legg til bruker' }));

    await waitFor(() => {
      expect(mockCreateUser).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Beboer',
          email: 'test@example.test',
          schoolId: 'school-ntnu',
          studyId: 'study-data',
          birthDate: undefined,
        })
      );
    });

    const created = await screen.findByRole('dialog', { name: 'Bruker opprettet' });
    expect(within(created).getByLabelText('Midlertidig passord')).toHaveTextContent('abc123');
    expect(screen.queryByRole('dialog', { name: 'Ny bruker' })).not.toBeInTheDocument();

    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    await user.click(within(created).getByRole('button', { name: 'Kopier' }));
    expect(writeText).toHaveBeenCalledWith('abc123');
    expect(within(created).getByRole('button', { name: 'Kopiert' })).toBeInTheDocument();

    await user.click(within(created).getByRole('button', { name: 'Ferdig' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('prevents submission when school and study lookups are unavailable', async () => {
    const user = userEvent.setup();
    mockGetSchools.mockResolvedValueOnce([]);
    mockGetStudies.mockResolvedValueOnce([]);

    render(<AddUserPage />);

    const form = await openForm(user);
    await user.type(within(form).getByLabelText(/^navn/i), 'Test Beboer');
    await user.type(within(form).getByLabelText(/^e-post/i), 'test@example.test');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Legg til bruker' })).toBeDisabled();
    });
    expect(within(form).getByText('Kunne ikke laste skoler og studier.')).toBeInTheDocument();
    expect(mockCreateUser).not.toHaveBeenCalled();
  });

  it('flags an invalid e-mail address', async () => {
    const user = userEvent.setup();
    render(<AddUserPage />);

    const form = await openForm(user);
    await user.type(within(form).getByLabelText(/^navn/i), 'Test Beboer');
    await user.type(within(form).getByLabelText(/^e-post/i), 'ikke-en-epost');
    await user.tab();

    expect(within(form).getByText('Ugyldig e-postadresse')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Legg til bruker' })).toBeDisabled();
  });

  it('deactivates a user after confirming, but never offers it for admins', async () => {
    const user = userEvent.setup();
    mockDeleteUser.mockResolvedValue(undefined);
    render(<AddUserPage />);

    const table = await screen.findByRole('table');
    expect(
      within(table).queryByRole('button', { name: 'Deaktiver Admin Person' })
    ).not.toBeInTheDocument();

    await user.click(within(table).getByRole('button', { name: 'Deaktiver Kari Beboer' }));
    const confirm = screen.getByRole('dialog', { name: 'Deaktivere bruker?' });
    await user.click(within(confirm).getByRole('button', { name: 'Deaktiver' }));

    await waitFor(() => expect(mockDeleteUser).toHaveBeenCalledWith('u1'));
    expect(await screen.findByText('Kari Beboer ble deaktivert.')).toBeInTheDocument();
  });
});
