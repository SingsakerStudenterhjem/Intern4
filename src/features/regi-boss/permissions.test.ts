import { describe, expect, it } from 'vitest';
import { USER_ROLES } from '../../shared/types/roles';
import { canApproveWork } from './permissions';

describe('regi permissions', () => {
  it('allows existing regi manager roles', () => {
    for (const role of [USER_ROLES.ADMIN, USER_ROLES.DATA, USER_ROLES.WORKMANAGER]) {
      expect(canApproveWork(role)).toBe(true);
    }
  });

  it('blocks normal resident roles', () => {
    for (const role of [USER_ROLES.HALF_HALF, USER_ROLES.FULL_WORK, undefined]) {
      expect(canApproveWork(role)).toBe(false);
    }
  });
});
