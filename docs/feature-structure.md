# Feature Structure

The app is organized by business domains, not by roles. Roles and dedicated station users
control access to domain workflows, but they should not define top-level source folders.

## Boundaries

- `src/app` owns app shell concerns: routing composition, navigation composition, providers, and layout.
- `src/features` owns product domains such as `regi`, `shifts`, `verv`, `alcohol`, and `wine-cellar`.
- `src/server` owns Supabase access and persistence mapping.
- `src/shared` owns app-independent types, utilities, and reusable UI primitives.

## Feature Contract

Each domain feature should use these files as it grows:

- `routes.tsx` exports feature route definitions.
- `navigation.ts` exports feature navigation items.
- `permissions.ts` exports domain capability checks.
- `types.ts` contains feature-local view and domain types when needed.
- `api/` contains feature-facing data operations that call `src/server/dao`.

Small features can stay flat. Large features should split by workflow before they accumulate
large `components` and `hooks` folders.

## Current Large-Feature Pattern

`regi` is split by workflow:

- `my-regi`
- `approvals`
- `status`
- `logs`
- `granting`

Use the same pattern for future broad domains such as `alcohol`, `wine-cellar`, and `shifts`.
