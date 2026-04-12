import { describe, expect, it } from 'vitest';
import { protectedRoutes } from './routeConfig';
import { ROUTES } from '../app/constants/routes';

describe('routeConfig', () => {
  it('exposes the profil route and removes the old about_me slug', () => {
    expect(protectedRoutes.some((route) => route.path === ROUTES.PROFILE)).toBe(true);
    expect(protectedRoutes.some((route) => route.path === '/about_me')).toBe(false);
  });
});
