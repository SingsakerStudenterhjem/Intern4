import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import WorkApprovalModal from './WorkApprovalModal';
import type { PendingRegiApproval } from '../../../../shared/types/regi';

const createSignedImageUrls = vi.fn();

vi.mock('../../../../server/storage', () => ({
  createSignedImageUrls: (...args: unknown[]) => createSignedImageUrls(...args),
}));

const approval: PendingRegiApproval = {
  id: 'approval-1',
  userId: '11111111-1111-4111-8111-111111111111',
  userName: 'Kari Godkjenner',
  userEmail: 'kari@example.com',
  sourceType: 'misc',
  title: 'Regiarbeid',
  description: 'Dokumentert med bilder',
  category: 'Regi',
  hours: 2,
  createdAt: new Date('2026-04-11T10:00:00.000Z'),
  imagePaths: ['user/regi/one.png'],
};

describe('WorkApprovalModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    createSignedImageUrls.mockResolvedValue(['https://example.com/one.png']);
  });

  it('renders attached regi images', async () => {
    render(
      <WorkApprovalModal
        approval={approval}
        onClose={vi.fn()}
        onApprove={vi.fn()}
        onReject={vi.fn()}
      />
    );

    expect(await screen.findByAltText('Opplastet bilde 1')).toHaveAttribute(
      'src',
      'https://example.com/one.png'
    );
  });
});
