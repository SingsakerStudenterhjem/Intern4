import { describe, expect, it } from 'vitest';
import { USER_ROLES } from '../../shared/types/roles';
import { canAccessRoomManagement } from './permissions';

describe('user permissions', () => {
  it('allows existing room management roles', () => {
    for (const role of [USER_ROLES.ADMIN, USER_ROLES.DATA, USER_ROLES.ROOMMANAGER]) {
      expect(canAccessRoomManagement(role)).toBe(true);
    }
  });

  it('blocks normal resident roles', () => {
    for (const role of [USER_ROLES.HALF_HALF, USER_ROLES.FULL_WORK, undefined]) {
      expect(canAccessRoomManagement(role)).toBe(false);
    }
  });
});
