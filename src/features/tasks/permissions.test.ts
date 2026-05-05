import { describe, expect, it } from 'vitest';
import { USER_ROLES } from '../../shared/types/roles';
import { canManageCategories, canManageTasks, canViewAllParticipants } from './permissions';

describe('task permissions', () => {
  it('allows existing task manager roles', () => {
    for (const role of [USER_ROLES.ADMIN, USER_ROLES.DATA, USER_ROLES.WORKMANAGER]) {
      expect(canManageTasks(role)).toBe(true);
      expect(canManageCategories(role)).toBe(true);
      expect(canViewAllParticipants(role)).toBe(true);
    }
  });

  it('blocks normal resident roles', () => {
    for (const role of [USER_ROLES.HALF_HALF, USER_ROLES.FULL_WORK, undefined]) {
      expect(canManageTasks(role)).toBe(false);
    }
  });
});
