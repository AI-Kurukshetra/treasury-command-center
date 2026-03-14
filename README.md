# Treasury Command Center

Enterprise treasury and cash management platform built from the SRS and architecture docs in `/docs`.

## Stack
- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn-style UI primitives
- Supabase for auth and data
- Playwright for end-to-end testing
- Vercel deployment target

## Quick Start
1. Copy `.env.example` to `.env.local`.
2. Configure your Supabase project credentials.
3. Install dependencies with `npm install`.
4. Start the app with `npm run dev`.

## Required Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

## Authentication
- Open `/auth/sign-in`
- Sign in with a real Supabase email/password user
- Ensure the user also has a matching `profiles` row and an active `organization_memberships` row

## Supabase
- SQL migrations live in `supabase/migrations`
- The app uses Supabase SSR auth and Postgres-backed data only
- Seed at least one organization, membership, and cash snapshot for the dashboard to show tenant data

## Tests
- Run `npm run test:e2e`
