import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import HomePage from './HomePage';
import { getMyActiveTasks, getSuggestedTasks, summarizeSemesterRegi } from './useHomeData';
import type { RegiLogWithId } from '../../shared/types/regi';
import type { Task, TaskParticipant } from '../../shared/types/regi/tasks';
import { getPendingRegiApprovals, getRegiLogsByUser } from '../../server/dao/regiDAO';
import { getTasks, joinTask } from '../../server/dao/tasksDAO';

const ME = '11111111-1111-4111-8111-111111111111';
const mockUseAuth = vi.fn();

vi.mock('../providers/AuthContext', () => ({ useAuth: () => mockUseAuth() }));
vi.mock('../../server/dao/regiDAO', () => ({
  getRegiLogsByUser: vi.fn(),
  getPendingRegiApprovals: vi.fn(),
}));
vi.mock('../../server/dao/tasksDAO', () => ({
  getTasks: vi.fn(),
  joinTask: vi.fn(),
  leaveTask: vi.fn(),
  submitTaskCompletion: vi.fn(),
}));
vi.mock('../../server/dao/categoriesDAO', () => ({
  getCategories: vi.fn().mockResolvedValue([]),
}));
vi.mock('../../server/dao/userDAO', () => ({
  getUserNames: vi.fn().mockResolvedValue({}),
}));

const log = (overrides: Partial<RegiLogWithId>): RegiLogWithId => ({
  id: '1',
  userId: ME,
  title: 'Regi',
  hours: 1,
  date: new Date(2026, 8, 1),
  createdAt: new Date(2026, 8, 1),
  sourceType: 'misc',
  status: 'approved',
  type: 'Regi',
  ...overrides,
});

const participant = (status: TaskParticipant['status']): TaskParticipant => ({
  assignmentId: `a-${status}`,
  userId: ME,
  status,
  joinedAt: '2026-09-01T10:00:00.000Z',
});

const task = (id: string, overrides: Partial<Task> = {}): Task => ({
  id,
  title: `Oppgave ${id}`,
  category: 'Regi',
  deadline: null,
  hourEstimate: 2,
  maxParticipants: 3,
  participants: [],
  createdAt: '2026-09-01T10:00:00.000Z',
  isArchived: false,
  ...overrides,
});

describe('home page helpers', () => {
  it('only counts this semester towards the requirement', () => {
    const summary = summarizeSemesterRegi(
      [
        log({ hours: 10, date: new Date(2026, 7, 15) }),
        log({ hours: 20, date: new Date(2026, 5, 1) }), // last semester
        log({ hours: 3, status: 'pending', date: new Date(2026, 8, 2) }),
        log({ hours: 5, status: 'rejected', date: new Date(2026, 8, 3) }),
      ],
      'Halv/Halv',
      new Date(2026, 9, 19)
    );

    expect(summary).toEqual({ approved: 10, pending: 3, required: 18, remaining: 8 });
  });

  it('lists my unfinished tasks with rework first', () => {
    const tasks = [
      task('submitted', { participants: [participant('submitted')] }),
      task('done', { participants: [participant('approved')] }),
      task('rejected', { participants: [participant('rejected')] }),
      task('open'),
    ];

    expect(getMyActiveTasks(tasks, ME).map((t) => t.id)).toEqual(['rejected', 'submitted']);
  });

  it('suggests at most three joinable tasks, soonest deadline first', () => {
    const tasks = [
      task('no-deadline'),
      task('late', { deadline: '2026-12-01T10:00:00.000Z' }),
      task('soon', { deadline: '2026-10-21T10:00:00.000Z' }),
      task('mine', { participants: [participant('joined')] }),
      task('archived', { isArchived: true }),
      task('mid', { deadline: '2026-11-01T10:00:00.000Z' }),
    ];

    expect(getSuggestedTasks(tasks, ME).map((t) => t.id)).toEqual(['soon', 'mid', 'late']);
  });
});

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getRegiLogsByUser).mockResolvedValue([log({ hours: 4, date: new Date() })]);
    vi.mocked(getTasks).mockResolvedValue([task('1', { title: 'Male gang' })]);
    vi.mocked(getPendingRegiApprovals).mockResolvedValue([]);
  });

  const renderHome = () =>
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

  it('greets the user and hides the approvals card from residents', async () => {
    mockUseAuth.mockReturnValue({ user: { id: ME, name: 'Bjørn Beboersen', role: 'Halv/Halv' } });
    renderHome();

    expect(screen.getByRole('heading', { name: 'Hei, Bjørn!' })).toBeInTheDocument();
    expect(await screen.findByText('Male gang')).toBeInTheDocument();
    expect(screen.getByText('av 18 t')).toBeInTheDocument();
    expect(screen.queryByText(/venter på godkjenning$/)).not.toBeInTheDocument();
    expect(getPendingRegiApprovals).not.toHaveBeenCalled();
  });

  it('shows pending approvals to regi managers', async () => {
    mockUseAuth.mockReturnValue({ user: { id: ME, name: 'Ada', role: 'Regisjef' } });
    vi.mocked(getPendingRegiApprovals).mockResolvedValue(
      Array.from({ length: 2 }, (_, index) => ({ id: String(index) })) as never
    );
    renderHome();

    const link = await screen.findByRole('link', { name: /2 venter på godkjenning/i });
    expect(link).toHaveAttribute('href', '/regisjef/godkjenning');
  });

  it('joins a suggested task and refreshes', async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue({ user: { id: ME, name: 'Bjørn', role: 'Halv/Halv' } });
    vi.mocked(joinTask).mockResolvedValue(true);
    renderHome();

    const card = (await screen.findByText('Male gang')).closest('article') as HTMLElement;
    await user.click(within(card).getByRole('button', { name: 'Meld på' }));

    await waitFor(() => expect(joinTask).toHaveBeenCalledWith('1', ME));
    expect(await screen.findByText('Du er påmeldt oppgaven!')).toBeInTheDocument();
    expect(getTasks).toHaveBeenCalledTimes(2);
  });
});
