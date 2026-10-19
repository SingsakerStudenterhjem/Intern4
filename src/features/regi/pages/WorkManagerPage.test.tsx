import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import WorkManagerPage from './WorkManagerPage';
import { getPendingRegiApprovals } from '../../../server/dao/regiDAO';

vi.mock('../../../app/providers/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'manager', role: 'Regisjef' }, loading: false }),
}));
vi.mock('../../../server/dao/regiDAO', () => ({
  ALREADY_PROCESSED_MESSAGE: 'allerede behandlet',
  getPendingRegiApprovals: vi.fn(),
  approveRegiLog: vi.fn(),
  rejectRegiLog: vi.fn(),
}));
vi.mock('../../../server/dao/categoriesDAO', () => ({
  getCategories: vi.fn().mockResolvedValue([]),
}));
vi.mock('../approvals/components/WorkApprovalList', () => ({
  default: ({ approvals }: { approvals: unknown[] }) => (
    <div data-testid="approval-list">{approvals.length} approvals</div>
  ),
}));
vi.mock('../granting/components/GrantRegiForm', () => ({
  default: () => <div data-testid="grant-regi-form" />,
}));
vi.mock('../status/components/Registatus', () => ({
  default: () => <div data-testid="registatus" />,
}));
vi.mock('../logs/components/RegiLogsPanel', () => ({
  default: () => <div data-testid="regi-logs" />,
}));

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        {[
          '/regisjef',
          '/regisjef/godkjenning',
          '/regisjef/status',
          '/regisjef/gi-regi',
          '/regisjef/logg',
        ].map((routePath) => (
          <Route key={routePath} path={routePath} element={<WorkManagerPage />} />
        ))}
      </Routes>
    </MemoryRouter>
  );

describe('WorkManagerPage', () => {
  beforeEach(() => {
    vi.mocked(getPendingRegiApprovals).mockResolvedValue([{ id: '1' }, { id: '2' }] as never);
  });

  it('opens on the approval tab with the pending count', async () => {
    renderAt('/regisjef');

    expect(await screen.findByText('2 approvals')).toBeInTheDocument();
    const tab = screen.getByRole('tab', { name: /godkjenning/i });
    expect(tab).toHaveAttribute('aria-selected', 'true');
    expect(within(tab).getByText('2')).toBeInTheDocument();
  });

  it('switches tabs through their URLs', async () => {
    const user = userEvent.setup();
    renderAt('/regisjef');

    await user.click(screen.getByRole('tab', { name: 'Registatus' }));
    expect(screen.getByTestId('registatus')).toBeInTheDocument();
    expect(screen.queryByTestId('approval-list')).not.toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Gi regi' }));
    expect(screen.getByTestId('grant-regi-form')).toBeInTheDocument();
  });

  it('opens the log tab directly from its link', () => {
    renderAt('/regisjef/logg');

    expect(screen.getByRole('tab', { name: 'Logg' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('regi-logs')).toBeInTheDocument();
  });
});
