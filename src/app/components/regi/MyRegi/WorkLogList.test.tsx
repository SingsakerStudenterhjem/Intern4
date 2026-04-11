import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import WorkLogList from './WorkLogList';
import type { RegiLogWithId } from '../../../../shared/types/regi';

const getRegiLogsByUser = vi.fn();
const deletePendingRegiLog = vi.fn();

vi.mock('../../../../server/dao/regiDAO', () => ({
  getRegiLogsByUser: (...args: unknown[]) => getRegiLogsByUser(...args),
  deletePendingRegiLog: (...args: unknown[]) => deletePendingRegiLog(...args),
}));

const createLog = (overrides: Partial<RegiLogWithId> = {}): RegiLogWithId => ({
  id: '1',
  title: 'Rigge lyd',
  description: 'Setter opp anlegg',
  date: new Date('2026-04-11T09:00:00.000Z'),
  hours: 2.5,
  type: 'Dataarbeid',
  status: 'pending',
  createdAt: new Date('2026-04-11T11:00:00.000Z'),
  userId: '11111111-1111-1111-1111-111111111111',
  sourceType: 'misc',
  reviewerComment: undefined,
  ...overrides,
});

describe('WorkLogList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      'confirm',
      vi.fn(() => true)
    );
  });

  it('opens the details modal when clicking a log row and shows reviewer comment', async () => {
    getRegiLogsByUser.mockResolvedValue([
      createLog({
        id: 'approved-log',
        status: 'approved',
        reviewerComment: 'Ser bra ut.',
      }),
    ]);

    render(
      <WorkLogList
        userId="11111111-1111-1111-1111-111111111111"
        userRole="Full Regi"
        refreshKey={0}
      />
    );

    const rowTitle = await screen.findByText('Rigge lyd');
    await userEvent.click(rowTitle);

    expect(await screen.findByText('Kommentar fra regisjef')).toBeInTheDocument();
    expect(screen.getByText('Ser bra ut.')).toBeInTheDocument();
    expect(screen.getByText('Manuell registrering')).toBeInTheDocument();
  });

  it('shows delete only for pending manual logs', async () => {
    getRegiLogsByUser.mockResolvedValue([
      createLog({ id: 'pending-manual', title: 'Manuell pending' }),
      createLog({
        id: 'pending-task',
        title: 'Oppgave pending',
        sourceType: 'task',
      }),
      createLog({
        id: 'approved-manual',
        title: 'Manuell approved',
        status: 'approved',
      }),
    ]);

    render(
      <WorkLogList
        userId="11111111-1111-1111-1111-111111111111"
        userRole="Full Regi"
        refreshKey={0}
      />
    );

    expect(await screen.findByText('Manuell pending')).toBeInTheDocument();

    const deleteButtons = screen.getAllByRole('button', { name: /slett/i });
    expect(deleteButtons).toHaveLength(1);

    const pendingManualRow = screen.getByText('Manuell pending').closest('tr');
    const pendingTaskRow = screen.getByText('Oppgave pending').closest('tr');
    const approvedManualRow = screen.getByText('Manuell approved').closest('tr');

    expect(
      within(pendingManualRow as HTMLTableRowElement).getByRole('button', { name: /slett/i })
    ).toBeInTheDocument();
    expect(within(pendingTaskRow as HTMLTableRowElement).getByText('—')).toBeInTheDocument();
    expect(within(approvedManualRow as HTMLTableRowElement).getByText('—')).toBeInTheDocument();
  });

  it('deletes a pending manual log without opening the details modal', async () => {
    getRegiLogsByUser.mockResolvedValue([
      createLog({
        id: 'delete-me',
        title: 'Slettbar logg',
      }),
    ]);
    deletePendingRegiLog.mockResolvedValue(undefined);

    render(
      <WorkLogList
        userId="11111111-1111-1111-1111-111111111111"
        userRole="Full Regi"
        refreshKey={0}
      />
    );

    const deleteButton = await screen.findByRole('button', { name: /slett/i });
    await userEvent.click(deleteButton);

    await waitFor(() => {
      expect(deletePendingRegiLog).toHaveBeenCalledWith(
        'delete-me',
        '11111111-1111-1111-1111-111111111111'
      );
    });

    await waitFor(() => {
      expect(screen.queryByText('Slettbar logg')).not.toBeInTheDocument();
    });

    expect(screen.queryByText('Kommentar fra regisjef')).not.toBeInTheDocument();
  });
});
