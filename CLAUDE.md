# Ottawa Super League

Mobile-first web app for the Ottawa Super League golf league at The Meadows Golf & Country Club.

## Tech Stack

- Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui
- Drizzle ORM + libSQL (local SQLite dev / Turso cloud production)
- Recharts for charts, react-hook-form + zod for forms
- Roboto font, green (#186732) primary branding

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run db:generate  # Generate Drizzle migrations
npm run db:push      # Push schema to database
npm run db:seed      # Seed database with Summer Tour 2025 data
npm run db:studio    # Open Drizzle Studio
```

## Architecture

- All stats (W/L/T, leaderboard rankings, averages) computed at read time from raw score rows
- Handicap differential stored per score record (computed at insert time, never changes)
- Win/Loss/Tie auto-calculated by grouping scores by round_date (lowest score wins)
- ISR with 5-min revalidation on read pages
- Score submission: POST /api/scores → DB insert → revalidate paths

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
