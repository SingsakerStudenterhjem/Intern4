export const FEATURE_ORDER = [
  'auth',
  'tasks',
  'residents',
  'shifts',
  'regi',
  'regiBoss',
  'verv',
  'alcohol',
  'wine-cellar',
  'helga',
  'users',
  'reception',
] as const;

export type FeatureKey = (typeof FEATURE_ORDER)[number];
