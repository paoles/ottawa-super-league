# Ottawa Super League

Mobile-first web app for the Ottawa Super League golf league at The Meadows Golf & Country Club.

## Tech Stack

- Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui
- Drizzle ORM + libSQL (local SQLite dev / Turso cloud production)
- Recharts for charts, react-hook-form + zod for forms
- bcryptjs for password hashing
- Roboto font, green (#186732) primary branding

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run db:generate  # Generate Drizzle migrations
npm run db:push      # Push schema to database
npm run db:seed      # Seed database with Summer Tour 2025 data
npm run db:studio    # Open Drizzle Studio
npx tsx scripts/hash-password.ts "password"  # Generate bcrypt hash for .env.local
```

## Architecture

- All stats (W/L/T, leaderboard rankings, averages) computed at read time from raw score rows
- Handicap differential stored per score record (computed at insert time, never changes)
- Win/Loss/Tie auto-calculated by grouping scores by round_date (lowest score wins)
- ISR with 5-min revalidation on read pages
- Score submission: POST /api/scores → DB insert → revalidate paths
- Route groups: public pages in `src/app/(public)/` (Header/Footer layout), admin in `src/app/admin/` (AdminNav layout)

## Admin

- Single-admin auth via bcrypt password hash + HMAC-signed session cookie
- Env vars: `ADMIN_PASSWORD_HASH` (bcrypt hash), `ADMIN_SESSION_SECRET` (HMAC key)
- **In `.env.local`**: escape `$` as `\$` in the hash value (Next.js interpolates `$` otherwise)
- **On Vercel**: paste the raw hash with plain `$` signs — no escaping needed
- Generate hash: `npx tsx scripts/hash-password.ts "yourpassword"` — prints both raw and escaped versions
- Middleware (`src/middleware.ts`) protects `/admin/*` and `/api/admin/*` (except `/admin/login`)
- Admin layout (`src/app/admin/layout.tsx`) is a client component — hides nav on `/admin/login`
- Session cookie set directly on `NextResponse` in the login route handler (not via `cookies()` from next/headers)
- Admin routes: `/admin` (dashboard), `/admin/players` (CRUD), `/admin/scores` (edit/delete)
- Admin API: POST `/api/admin/players`, PUT/DELETE `/api/admin/players/[id]`, PUT/DELETE `/api/admin/scores/[id]`
- Player delete blocked if player has scores (409 Conflict)
- Score edit recalculates handicap differential automatically

## Course Data

4 nine-hole courses at The Meadows, all par 36. Tee boxes: White, Blue.

| Course | Tee   | CR    | Slope |
|--------|-------|-------|-------|
| East   | White | 34.7  | 124   |
| East   | Blue  | 35.9  | 128   |
| North  | White | 34.0  | 122   |
| North  | Blue  | 34.8  | 126   |
| West   | White | 34.6  | 126   |
| West   | Blue  | 35.9  | 128   |
| South  | White | 33.9  | 122   |
| South  | Blue  | 34.8  | 125   |

Handicap formula: `(Score - CR) * 113 / Slope`

## Key Rules

- Players with 10+ games played receive a numeric rank
- Players with <10 GP are shown but unranked (rank displays as "—")
- "(Social)" is an admin-managed tag; social players are ranked the same as regular players
- Unique constraint: one score per player per course per date

## Conventions

- All chart components must be 'use client' wrappers (Recharts requires browser APIs)
- Use `z.number()` with `valueAsNumber: true` in forms (not `z.coerce.number()`)
- CSS variables use oklch color space for the shadcn/ui theme
- Primary green: oklch(0.4 0.12 145) ≈ #186732
- Set cookies in Route Handlers via `response.cookies.set()` on the `NextResponse` object, NOT via `cookies()` from `next/headers`
