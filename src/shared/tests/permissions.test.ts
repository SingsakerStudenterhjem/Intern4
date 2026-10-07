import { describe, expect, it } from 'vitest';
import { USER_ROLES } from '../types/roles';
import {
  canAccessRoomManagement,
  canApproveWork,
  canManageCategories,
  canManageTasks,
  canViewAllParticipants,
} from '../permissions';

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

