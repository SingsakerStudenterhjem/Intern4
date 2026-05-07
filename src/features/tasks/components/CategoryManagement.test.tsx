import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CategoryManagement from './CategoryManagement';
import type { Category } from '../../../shared/types/regi/tasks';

const categories: Category[] = [
  {
    id: 'category-1',
    name: 'Dataarbeid',
    description: 'Oppgaver med IT og systemer',
    color: '#3B82F6',
    isActive: true,
    createdAt: new Date('2026-04-10T10:00:00.000Z'),
  },
  {
    id: 'category-2',
    name: 'Vask',
    description: 'Rydding og renhold',
    color: '#10B981',
    isActive: true,
    createdAt: new Date('2026-04-11T10:00:00.000Z'),
  },
];

const renderCategoryManagement = (
  overrides: Partial<ComponentProps<typeof CategoryManagement>> = {}
) => {
  const props = {
    categories,
    onAddCategory: vi.fn().mockResolvedValue(undefined),
    onUpdateCategory: vi.fn().mockResolvedValue(undefined),
    onDeleteCategory: vi.fn().mockResolvedValue(undefined),
    getCategoryUsage: vi.fn().mockImplementation((categoryName: string) => {
      const counts: Record<string, number> = {
        Dataarbeid: 3,
        Vask: 0,
      };

      return Promise.resolve(counts[categoryName] ?? 0);
    }),
    onClose: vi.fn(),
    ...overrides,
  };

  render(<CategoryManagement {...props} />);

  return props;
};

describe('CategoryManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a modal with compact category rows and usage counts', async () => {
    renderCategoryManagement();

    expect(screen.getByRole('dialog', { name: 'Kategorier' })).toBeInTheDocument();
    expect(await screen.findByText('Dataarbeid')).toBeInTheDocument();
    expect(screen.getByText('3 oppgaver')).toBeInTheDocument();
    expect(screen.getByText('Vask')).toBeInTheDocument();
    expect(screen.getByText('0 oppgaver')).toBeInTheDocument();

    const row = screen.getByText('Dataarbeid').closest('li');
    expect(row).toHaveClass('py-2');
    expect(screen.getByRole('button', { name: 'Rediger Dataarbeid' })).toHaveClass('h-8', 'w-8');
    expect(screen.getByRole('button', { name: 'Slett Dataarbeid' })).toHaveClass('h-8', 'w-8');
  });

  it('filters categories by search query', async () => {
    const user = userEvent.setup();
    renderCategoryManagement();

    await screen.findByText('Dataarbeid');
    await user.type(screen.getByPlaceholderText(/søk i kategorier/i), 'vask');

    expect(screen.queryByText('Dataarbeid')).not.toBeInTheDocument();
    expect(screen.getByText('Vask')).toBeInTheDocument();
  });

  it('adds a category with trimmed form data', async () => {
    const user = userEvent.setup();
    const onAddCategory = vi.fn().mockResolvedValue(undefined);
    renderCategoryManagement({ onAddCategory });

    await screen.findByText('Dataarbeid');
    await user.click(screen.getByRole('button', { name: /ny kategori/i }));

    await user.type(screen.getByLabelText(/kategorinavn/i), '  Strøm  ');
    await user.type(screen.getByLabelText(/beskrivelse/i), '  Elektrisk arbeid  ');
    await user.click(screen.getByRole('button', { name: 'Legg til' }));

    await waitFor(() => {
      expect(onAddCategory).toHaveBeenCalledWith({
        name: 'Strøm',
        description: 'Elektrisk arbeid',
        color: '#3B82F6',
        isActive: true,
      });
    });
    expect(screen.queryByRole('dialog', { name: 'Ny kategori' })).not.toBeInTheDocument();
  });

  it('updates the selected category', async () => {
    const user = userEvent.setup();
    const onUpdateCategory = vi.fn().mockResolvedValue(undefined);
    renderCategoryManagement({ onUpdateCategory });

    await screen.findByText('Dataarbeid');
    await user.click(screen.getByRole('button', { name: 'Rediger Vask' }));

    const formDialog = screen.getByRole('dialog', { name: 'Rediger kategori' });
    const nameInput = within(formDialog).getByLabelText(/kategorinavn/i);
    await user.clear(nameInput);
    await user.type(nameInput, '  Kjøkken  ');
    await user.click(within(formDialog).getByRole('button', { name: 'Lagre endringer' }));

    await waitFor(() => {
      expect(onUpdateCategory).toHaveBeenCalledWith('category-2', {
        name: 'Kjøkken',
        description: 'Rydding og renhold',
        color: '#10B981',
      });
    });
  });

  it('blocks duplicate category names', async () => {
    const user = userEvent.setup();
    const onAddCategory = vi.fn().mockResolvedValue(undefined);
    renderCategoryManagement({ onAddCategory });

    await screen.findByText('Dataarbeid');
    await user.click(screen.getByRole('button', { name: /ny kategori/i }));
    await user.type(screen.getByLabelText(/kategorinavn/i), 'dataarbeid');
    await user.click(screen.getByRole('button', { name: 'Legg til' }));

    expect(
      await screen.findByText('En kategori med dette navnet eksisterer allerede')
    ).toBeInTheDocument();
    expect(onAddCategory).not.toHaveBeenCalled();
  });

  it('does not delete a category that is used by tasks', async () => {
    const user = userEvent.setup();
    const onDeleteCategory = vi.fn().mockResolvedValue(undefined);
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => undefined);

    renderCategoryManagement({ onDeleteCategory });

    await screen.findByText('3 oppgaver');
    await user.click(screen.getByRole('button', { name: 'Slett Dataarbeid' }));

    expect(confirmSpy).toHaveBeenCalledWith(
      'Er du sikker på at du vil slette kategorien "Dataarbeid"?'
    );
    expect(alertSpy).toHaveBeenCalledWith(
      'Kan ikke slette kategorien "Dataarbeid" fordi den brukes av 3 oppgaver.'
    );
    expect(onDeleteCategory).not.toHaveBeenCalled();
  });
});
