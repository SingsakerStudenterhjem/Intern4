import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AddUserPage from './addUserPage';

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

describe('AddUserPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    mockGetRoles.mockResolvedValue([{ id: 'role-halv', name: 'Halv/Halv' }]);
    mockGetAllUsersWithRole.mockResolvedValue([]);
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

  it('loads school and study options and submits selected lookup ids', async () => {
    const user = userEvent.setup();

    render(<AddUserPage />);

    await user.click(screen.getByRole('button', { name: 'Legg til bruker' }));
    await user.type(screen.getByLabelText('Navn *'), 'Test Beboer');
    await user.type(screen.getByLabelText('E-post *'), 'test@example.test');
    await user.click(screen.getByRole('button', { name: '+ Vis valgfrie felter' }));

    await user.selectOptions(await screen.findByLabelText('Studiested'), 'school-ntnu');
    await user.selectOptions(screen.getByLabelText('Studieprogram'), 'study-data');
    await user.click(screen.getAllByRole('button', { name: 'Legg til bruker' }).at(-1)!);

    await waitFor(() => {
      expect(mockCreateUser).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Beboer',
          email: 'test@example.test',
          schoolId: 'school-ntnu',
          studyId: 'study-data',
        })
      );
    });
  });

  it('prevents submission when school and study lookups are unavailable', async () => {
    const user = userEvent.setup();

    mockGetSchools.mockResolvedValueOnce([]);
    mockGetStudies.mockResolvedValueOnce([]);

    render(<AddUserPage />);

    await user.click(screen.getByRole('button', { name: 'Legg til bruker' }));
    await user.type(screen.getByLabelText('Navn *'), 'Test Beboer');
    await user.type(screen.getByLabelText('E-post *'), 'test@example.test');

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: 'Legg til bruker' }).at(-1)).toBeDisabled();
    });

    expect(mockCreateUser).not.toHaveBeenCalled();
  });
});
