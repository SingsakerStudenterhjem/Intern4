import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MobileTabBar from './MobileTabBar';
import { ThemeProvider } from '../providers/ThemeProvider';

const mockUseAuth = vi.fn();
const mockLogOut = vi.fn();

vi.mock('../providers/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('../../server/dao/authentication', () => ({
  logOut: (...args: unknown[]) => mockLogOut(...args),
}));

const renderTabBar = (path = '/regi') =>
  render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[path]}>
        <MobileTabBar />
      </MemoryRouter>
    </ThemeProvider>
  );

describe('MobileTabBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when logged out', () => {
    mockUseAuth.mockReturnValue({ user: null });
    renderTabBar();

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('marks the current tab and opens a role-filtered menu', async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue({
      user: { id: '1', name: 'Vanlig Bruker', email: 'bruker@example.com', role: 'Halv/Halv' },
    });
    renderTabBar('/regi');

    const tabBar = screen.getByRole('navigation', { name: 'Hovedmeny' });
    expect(within(tabBar).getByRole('link', { name: 'Min regi' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(within(tabBar).getByRole('link', { name: 'Oppgaver' })).not.toHaveAttribute(
      'aria-current'
    );

    await user.click(within(tabBar).getByRole('button', { name: 'Meny' }));

    const menu = screen.getByRole('dialog', { name: 'Meny' });
    expect(within(menu).getByRole('link', { name: 'Profil' })).toHaveAttribute('href', '/profil');
    expect(within(menu).queryByRole('link', { name: 'Regisjef' })).not.toBeInTheDocument();
    expect(within(menu).queryByRole('link', { name: 'Admin' })).not.toBeInTheDocument();

    await user.click(within(menu).getByRole('link', { name: 'Profil' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows manager links to regi managers and logs out', async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue({
      user: { id: '2', name: 'Regi Sjef', email: 'regi@example.com', role: 'Regisjef' },
    });
    mockLogOut.mockResolvedValue(undefined);
    renderTabBar('/regi/oppgaver');

    await user.click(screen.getByRole('button', { name: 'Meny' }));
    const menu = screen.getByRole('dialog', { name: 'Meny' });
    expect(within(menu).getByRole('link', { name: 'Regisjef' })).toBeInTheDocument();

    await user.click(within(menu).getByRole('button', { name: 'Logg ut' }));
    expect(mockLogOut).toHaveBeenCalledTimes(1);
  });
});
