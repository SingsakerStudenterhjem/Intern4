# Singsaker Studenterhjem internside

Repo for the internal "internside" system.

React, Tailwind, Vite, Supabase.

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
