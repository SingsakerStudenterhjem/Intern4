import type { ReactElement } from 'react';

export type PermissionUser = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
} | null;

export type PermissionContext = {
  user: PermissionUser;
};

export type PermissionCheck = (context: PermissionContext) => boolean;

export type FeatureRoute = {
  path: string;
  element: ReactElement;
  public?: boolean;
  allowedRoles?: string[];
};

export type FeatureNavChildItem = {
  key: string;
  label: string;
  to: string;
  canAccess?: PermissionCheck;
};

export type FeatureNavLinkItem = {
  key: string;
  label: string;
  to: string;
  canAccess?: PermissionCheck;
  children?: never;
};

export type FeatureNavGroupItem = {
  key: string;
  label: string;
  canAccess?: PermissionCheck;
  children: FeatureNavChildItem[];
  to?: never;
};

export type FeatureNavItem = FeatureNavLinkItem | FeatureNavGroupItem;

export type FeatureDefinition = {
  key: string;
  routes?: FeatureRoute[];
  navigation?: FeatureNavItem[];
};
