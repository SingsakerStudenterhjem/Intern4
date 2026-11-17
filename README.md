# Singsaker Studenterhjem internside

Repo for the internal "internside" system.

React, Tailwind, Vite, Supabase.

## Local development

You need Node.js 20 or newer and Docker Desktop.

1. Install dependencies:

   ```
   npm install
   ```

2. Start the local Supabase stack (Docker Desktop must be running):

   ```
   npx supabase start
   ```

3. Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_ANON_KEY` to the
   publishable key shown by `npx supabase status`.

4. Build the local database from the migrations and `supabase/seed.sql`:

   ```
   npx supabase db reset
   ```

5. Start the app with `npm run dev` and log in with one of the test users:

   | Email                 | Password     | Role      |
   | --------------------- | ------------ | --------- |
   | `admin@singsaker.no`  | `passord123` | Admin     |
   | `beboer@singsaker.no` | `passord123` | Halv/Halv |

Supabase Studio runs at http://127.0.0.1:54323. `npx supabase db reset` deletes all local
data and recreates it from the seed. Stop the stack with `npx supabase stop`.

## Available Scripts

In the project directory, you can run:

### `npm run dev`

Starts the Vite dev server.\
Open the local URL shown in the terminal to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Runs the Vitest test suite.

### `npm run build`

Builds the app for production to the `dist` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

### `npm run lint`

Runs ESLint across the project.

## Supabase migrations

This repo tracks the current remote Supabase schema as a pulled baseline in
`supabase/migrations/20260504193842_remote_schema.sql`, plus later project migrations.
The study/school lookup migration is intentionally guarded around `public.users` so the
Supabase CLI can replay migrations while creating a shadow database during `db pull`.
For new schema changes, add a new migration instead of editing the pulled baseline or writing
destructive follow-up SQL against production data.
