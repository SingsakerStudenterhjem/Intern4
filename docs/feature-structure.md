# Feature Structure

The app is organized by business domains. Roles and dedicated station users
control access to domain workflows, but they should not define top-level source folders.

## Boundaries

- `src/app` owns app shell concerns: routing composition, navigation composition, providers, and layout.
- `src/features` owns product domains such as `regi`, `shifts`, `verv`, `alcohol`, and `wine-cellar`.
- `src/server` owns Supabase access and persistence mapping.
- `src/shared` owns app-independent types, utilities, and reusable UI primitives.

## Feature Contract

Each domain feature should use these files as it grows:

- `index.ts` exports a feature manifest with the feature key, routes, and navigation.
- `paths.ts` exports feature-owned path constants used by routes, navigation, and links.
- `routes.tsx` exports feature route definitions.
- `navigation.ts` exports feature navigation items.
- `permissions.ts` exports domain capability checks.
- `types.ts` contains feature-local view and domain types when needed.
- `api/` contains feature-facing data operations that call `src/server/dao`.

Small features can stay flat. Large features should split by workflow before they accumulate
large `components` and `hooks` folders.

I.e. `regi` is split by workflow:

- `my-regi`
- `approvals`
- `status`
- `logs`
- `granting`

Use the same pattern for future broad domains such as `alcohol`, `wine-cellar`, and `shifts`.

Register feature order once in `src/features/featureOrder.ts`. `src/features/index.ts` maps that
order to feature manifests for route composition. `src/features/navigation.ts` maps that same order
to navigation-only modules so layout tests and navigation rendering do not load route page modules.
Keep only app-shell paths, such as `/` and `/admin`, in `src/app/constants/appRoutes.ts`.

## Adding a Feature

1. Create `src/features/<feature-name>/`.
2. Add `paths.ts` for route constants owned by the feature.
3. Add `routes.tsx` for pages exposed by the feature.
4. Add `navigation.ts` only if the feature appears in the navbar.
5. Add `permissions.ts` only if the feature has role or capability checks.
6. Export the feature manifest from `index.ts`.
7. Add the feature key to `src/features/featureOrder.ts`.
8. Add the feature manifest to the keyed map in `src/features/index.ts`.
9. Add the feature navigation to the keyed map in `src/features/navigation.ts` if the feature has navigation.

Prefer copying the shape of a small existing feature before inventing a new pattern.
