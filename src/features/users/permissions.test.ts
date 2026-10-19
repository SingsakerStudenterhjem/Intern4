import { describe, expect, it, vi } from 'vitest';
import { USER_ROLES } from '../../shared/types/roles';
import { canAccessRoomManagement, roomManagementRoles } from './permissions';
import { USER_PATHS } from './paths';
import { userRoutes } from './routes';

vi.mock('./pages/AddUserPage', () => ({ default: () => null }));
vi.mock('./pages/ProfilePage', () => ({ default: () => null }));

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

describe('user routes', () => {
  it('restricts user management to room management roles', () => {
    const route = userRoutes.find((r) => r.path === USER_PATHS.LEGG_TIL_BEBOER);
    expect(route?.allowedRoles).toEqual(roomManagementRoles);
  });
});
