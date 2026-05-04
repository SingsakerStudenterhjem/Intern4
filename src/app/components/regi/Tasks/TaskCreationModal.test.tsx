import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TaskCreationModal from './TaskCreationModal';
import type { Category, Task } from '../../../../shared/types/regi/tasks';
import type { TaskContactPersonOption } from './types';

const categories: Category[] = [
  {
    id: '1',
    name: 'Dataarbeid',
    description: 'Dataoppgaver',
    color: '#3B82F6',
    isActive: true,
    createdAt: new Date('2026-04-10T10:00:00.000Z'),
  },
];

const currentUser = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Kari Kontakt',
  email: 'kari@example.com',
  role: 'Data',
};

const contactPeople: TaskContactPersonOption[] = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Kari Kontakt',
    email: 'kari@example.com',
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    name: 'Ola Oppgave',
    email: 'ola@example.com',
  },
];

const editingTask: Task = {
  id: 'task-1',
  title: 'Eksisterende oppgave',
  category: 'Dataarbeid',
  description: 'Eksisterende beskrivelse',
  contactPersonId: '22222222-2222-4222-8222-222222222222',
  deadline: '2026-04-12T12:00:00.000Z',
  hourEstimate: 2,
  maxParticipants: 3,
  participants: [],
  createdAt: '2026-04-10T10:00:00.000Z',
  isArchived: false,
};

describe('TaskCreationModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('filters contact people, selects one user, and submits normalized creation data', async () => {
    const user = userEvent.setup();
    const onCreateTask = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(
      <TaskCreationModal
        isOpen
        onClose={onClose}
        onCreateTask={onCreateTask}
        categories={categories}
        currentUser={currentUser}
        contactPeople={contactPeople}
      />
    );

    await user.type(screen.getByLabelText(/oppgavenavn/i), '  Ny oppgave  ');
    await user.type(screen.getByLabelText(/beskrivelse/i), '  Viktig oppgave  ');
    await user.clear(screen.getByLabelText(/timeestimat/i));
    await user.type(screen.getByLabelText(/timeestimat/i), '2.5');
    await user.clear(screen.getByLabelText(/maksimalt antall deltakere/i));
    await user.type(screen.getByLabelText(/maksimalt antall deltakere/i), '4');

    const contactSearch = screen.getByPlaceholderText(/søk etter navn eller e-post/i);
    await user.clear(contactSearch);
    await user.type(contactSearch, 'ola');
    await user.click(screen.getByRole('button', { name: /ola oppgave/i }));

    await user.click(screen.getByRole('button', { name: /opprett oppgave/i }));

    await waitFor(() => {
      expect(onCreateTask).toHaveBeenCalledWith({
        title: 'Ny oppgave',
        category: 'Dataarbeid',
        description: 'Viktig oppgave',
        contactPersonId: '22222222-2222-4222-8222-222222222222',
        deadline: undefined,
        hourEstimate: 2.5,
        maxParticipants: 4,
      });
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows validation errors and does not submit invalid input', async () => {
    const user = userEvent.setup();
    const onCreateTask = vi.fn().mockResolvedValue(undefined);

    render(
      <TaskCreationModal
        isOpen
        onClose={vi.fn()}
        onCreateTask={onCreateTask}
        categories={categories}
        currentUser={currentUser}
        contactPeople={contactPeople}
      />
    );

    await user.clear(screen.getByLabelText(/oppgavenavn/i));
    await user.clear(screen.getByLabelText(/timeestimat/i));
    await user.type(screen.getByLabelText(/timeestimat/i), '0');
    await user.clear(screen.getByLabelText(/maksimalt antall deltakere/i));
    await user.type(screen.getByLabelText(/maksimalt antall deltakere/i), '0');
    await user.click(screen.getByRole('button', { name: /opprett oppgave/i }));

    expect(await screen.findByText('Oppgavenavn er påkrevd')).toBeInTheDocument();
    expect(screen.getByText('Timeestimat må være et positivt tall')).toBeInTheDocument();
    expect(screen.getByText('Maksimalt antall deltakere må være minst 1')).toBeInTheDocument();
    expect(onCreateTask).not.toHaveBeenCalled();
  });

  it('submits updates through onUpdateTask when editing an existing task', async () => {
    const user = userEvent.setup();
    const onUpdateTask = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(
      <TaskCreationModal
        isOpen
        onClose={onClose}
        onCreateTask={vi.fn()}
        onUpdateTask={onUpdateTask}
        categories={categories}
        currentUser={currentUser}
        editingTask={editingTask}
        contactPeople={contactPeople}
      />
    );

    const titleInput = screen.getByLabelText(/oppgavenavn/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'Oppdatert oppgave');
    await user.click(screen.getByRole('button', { name: /lagre endringer/i }));

    await waitFor(() => {
      expect(onUpdateTask).toHaveBeenCalledWith('task-1', {
        title: 'Oppdatert oppgave',
        category: 'Dataarbeid',
        description: 'Eksisterende beskrivelse',
        contactPersonId: '22222222-2222-4222-8222-222222222222',
        deadline: new Date('2026-04-12T12:00:00.000Z'),
        hourEstimate: 2,
        maxParticipants: 3,
      });
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
