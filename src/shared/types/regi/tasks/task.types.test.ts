import { describe, expect, it } from 'vitest';
import { safeParseTaskFormData, validateTaskCreationData } from './task.types';

describe('task.types', () => {
  it('accepts the normalized task creation payload', () => {
    const result = validateTaskCreationData({
      title: 'Vask felleskjøkken',
      category: 'Generelt',
      description: 'Rydd og vask benker',
      contactPersonId: '11111111-1111-4111-8111-111111111111',
      deadline: new Date('2026-04-10T10:00:00.000Z'),
      hourEstimate: 2.5,
      maxParticipants: 3,
    });

    expect(result.title).toBe('Vask felleskjøkken');
    expect(result.hourEstimate).toBe(2.5);
    expect(result.maxParticipants).toBe(3);
    expect(result.contactPersonId).toBe('11111111-1111-4111-8111-111111111111');
  });

  it('tracks the normalized form fields used by create and edit modals', () => {
    const result = safeParseTaskFormData({
      title: 'Sett opp stoler',
      category: 'Arrangement',
      description: '',
      contactPersonId: '22222222-2222-4222-8222-222222222222',
      deadline: '2026-04-10T18:00',
      hourEstimate: '1.5',
      maxParticipants: '4',
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.contactPersonId).toBe('22222222-2222-4222-8222-222222222222');
    expect(result.data.title).toBe('Sett opp stoler');
  });
});
