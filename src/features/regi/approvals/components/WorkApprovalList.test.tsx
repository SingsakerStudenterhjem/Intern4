import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import WorkApprovalList from './WorkApprovalList';

const mockUseAuth = vi.fn();
const mockGetPendingRegiApprovals = vi.fn();
const mockApproveRegiLog = vi.fn();
const mockRejectRegiLog = vi.fn();

vi.mock('../../../../app/providers/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('../../../../server/dao/regiDAO', () => ({
  getPendingRegiApprovals: (...args: unknown[]) => mockGetPendingRegiApprovals(...args),
  approveRegiLog: (...args: unknown[]) => mockApproveRegiLog(...args),
  rejectRegiLog: (...args: unknown[]) => mockRejectRegiLog(...args),
}));

vi.mock('./WorkApprovalModal', () => ({
  default: ({ approval }: { approval: { title: string } }) => (
    <div data-testid="work-approval-modal">{approval.title}</div>
  ),
}));

const approvals = [
  {
    id: 'approval-1',
    userId: '11111111-1111-4111-8111-111111111111',
    userName: 'Kari Godkjenner',
    userEmail: 'kari@example.com',
    sourceType: 'misc' as const,
    title:
      'Dette er en veldig lang tittel for å sikre at radhandlingen fortsatt er synlig selv når innholdet blir bredt',
    description: 'Lang beskrivelse for å teste at radlayouten holder seg stabil.',
    category: 'Generelt',
    hours: 2,
    date: new Date('2026-04-10T00:00:00.000Z'),
    createdAt: new Date('2026-04-11T10:00:00.000Z'),
  },
  {
    id: 'approval-2',
    userId: '22222222-2222-4222-8222-222222222222',
    userName: 'Ola Oppgave',
    userEmail: 'ola@example.com',
    sourceType: 'task' as const,
    title: 'Oppgaveinnsending',
    description: 'Kort beskrivelse.',
    category: 'Dataarbeid',
    hours: 1.5,
    date: new Date('2026-04-09T00:00:00.000Z'),
    createdAt: new Date('2026-04-10T12:00:00.000Z'),
  },
];

describe('WorkApprovalList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    mockUseAuth.mockReturnValue({
      user: {
        id: '99999999-9999-4999-8999-999999999999',
        role: 'Regisjef',
      },
      loading: false,
    });

    mockGetPendingRegiApprovals.mockResolvedValue(approvals);
    mockApproveRegiLog.mockResolvedValue(undefined);
    mockRejectRegiLog.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders action buttons for each pending approval and keeps long-title rows actionable', async () => {
    render(<WorkApprovalList />);

    expect((await screen.findAllByText('Kari Godkjenner')).length).toBeGreaterThan(0);

    expect(screen.getAllByLabelText(/godkjenn dette er en veldig lang tittel/i)).toHaveLength(2);
    expect(screen.getAllByLabelText(/avvis dette er en veldig lang tittel/i)).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: /godkjenn /i })).toHaveLength(4);
    expect(screen.getAllByRole('button', { name: /avvis /i })).toHaveLength(4);
  });

  it('triggers approve and reject without opening the modal, while row clicks still open it', async () => {
    const user = userEvent.setup();

    render(<WorkApprovalList />);

    expect((await screen.findAllByText('Kari Godkjenner')).length).toBeGreaterThan(0);

    await user.click(screen.getAllByLabelText(/godkjenn dette er en veldig lang tittel/i)[0]);

    await waitFor(() => {
      expect(mockApproveRegiLog).toHaveBeenCalledWith(
        'approval-1',
        '99999999-9999-4999-8999-999999999999',
        undefined
      );
    });
    expect(screen.queryByTestId('work-approval-modal')).not.toBeInTheDocument();

    await user.click(screen.getAllByText('Oppgaveinnsending')[0]);

    expect(screen.getByTestId('work-approval-modal')).toHaveTextContent('Oppgaveinnsending');

    await user.click(screen.getAllByLabelText(/avvis oppgaveinnsending/i)[0]);

    await waitFor(() => {
      expect(mockRejectRegiLog).toHaveBeenCalledWith('approval-2');
    });
  });

  it('renders loading, empty, and error states correctly', async () => {
    let resolveApprovals: ((value: typeof approvals) => void) | undefined;
    mockGetPendingRegiApprovals.mockReturnValue(
      new Promise<typeof approvals>((resolve) => {
        resolveApprovals = resolve;
      })
    );

    const { unmount } = render(<WorkApprovalList />);

    expect(screen.getAllByText('Laster...').length).toBeGreaterThan(0);

    resolveApprovals?.(approvals);

    expect((await screen.findAllByText('Kari Godkjenner')).length).toBeGreaterThan(0);

    unmount();
    mockGetPendingRegiApprovals.mockResolvedValueOnce([]);
    render(<WorkApprovalList />);
    expect(await screen.findAllByText('Ingen ventende registreringer.')).toHaveLength(2);

    unmount();
    mockGetPendingRegiApprovals.mockRejectedValueOnce(new Error('boom'));
    render(<WorkApprovalList />);
    expect(await screen.findByText('Kunne ikke laste godkjenninger.')).toBeInTheDocument();
  });

  it('keeps the mobile card actions separate from the row body', async () => {
    const user = userEvent.setup();

    render(<WorkApprovalList />);

    const cards = await screen.findAllByTestId('approval-card');
    const firstCard = cards[0];

    expect(within(firstCard).getByText('Kari Godkjenner')).toBeInTheDocument();

    await user.click(within(firstCard).getByLabelText(/godkjenn dette er en veldig lang tittel/i));

    await waitFor(() => {
      expect(mockApproveRegiLog).toHaveBeenCalledWith(
        'approval-1',
        '99999999-9999-4999-8999-999999999999',
        undefined
      );
    });
    expect(screen.queryByTestId('work-approval-modal')).not.toBeInTheDocument();
  });
});
