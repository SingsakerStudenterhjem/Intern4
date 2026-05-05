import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import WorkManagerPage from './WorkManagerPage';

vi.mock('../components/work-manager/WorkApprovalList', () => ({
  default: () => <div data-testid="approval-list">Approval list</div>,
}));

vi.mock('../components/work-manager/GrantRegiForm', () => ({
  default: () => <div data-testid="grant-regi-form">Grant regi form</div>,
}));

vi.mock('../components/work-manager/Registatus', () => ({
  default: () => <div data-testid="registatus">Registatus</div>,
}));

describe('WorkManagerPage', () => {
  it('renders the approval list before the lower dashboard cards', () => {
    render(
      <MemoryRouter>
        <WorkManagerPage />
      </MemoryRouter>
    );

    const approvalList = screen.getByTestId('approval-list');
    const grantForm = screen.getByTestId('grant-regi-form');
    const regstatus = screen.getByTestId('registatus');

    expect(
      approvalList.compareDocumentPosition(grantForm) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      approvalList.compareDocumentPosition(regstatus) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();

    expect(screen.getByRole('heading', { name: 'Godkjenningsliste' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /åpne logg/i })).toBeInTheDocument();
  });
});
