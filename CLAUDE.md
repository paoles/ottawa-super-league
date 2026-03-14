# Ottawa Super League

Mobile-first web app for the Ottawa Super League golf league at The Meadows Golf & Country Club.

## Tech Stack

- Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui
- Drizzle ORM + libSQL (local SQLite dev / Turso cloud production)
- Recharts for charts, react-hook-form + zod for forms
- bcryptjs for password hashing
- Roboto + Dancing Script fonts, green (#186732) primary branding

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
- Score submission: POST /api/scores → validates player IDs exist → DB insert → revalidate paths
- Score form: 5-step wizard (Date → Course → Players → Scores → Review); tee box set per player in step 3; step-tee.tsx is unused dead code
- Per-player tee: stored in FormData as Map<number, Tee>; API payload includes tee per player entry
- Score step: suggestions (avg±2 buttons) shown before entry; −/+ buttons shown after entry; handicap hidden (review only)
- Course tile order: North/West top row, South/East bottom row
- Route groups: public pages in `src/app/(public)/` (Header/Footer layout), admin in `src/app/admin/` (AdminNav layout)

## Admin

- Single-admin auth via bcrypt password hash + HMAC-signed session cookie
- Env vars: `ADMIN_PASSWORD_HASH` (bcrypt hash), `ADMIN_SESSION_SECRET` (32-byte hex random secret)
- Generate session secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
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

## Security

- Session token format: `{uuid}:{issuedAt}.{hmac}` — expiration validated server-side in both middleware and auth.ts
- Login rate limiting: 5 failed attempts per IP → 15-min lockout (in-memory; resets per serverless instance)
- CSV export (`/api/export`) requires valid admin session
- Score submission validates all player IDs exist in DB before any inserts
- Security headers on all responses: HSTS, X-Content-Type-Options, X-Frame-Options: DENY, Referrer-Policy, Permissions-Policy
- CSRF: covered by SameSite=lax cookies (cross-site POST/PUT/DELETE requests do not include the cookie)
- console.error logs only error.message, never full error objects

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

## Statistics Page Design

- Server page fetches `getScoreTrends()` (includes `course` field) + `getCourseBreakdowns()`, passes to `StatisticsClient`
- Heading: "Statistics" in Dancing Script + green decorative divider; icon-only `CsvExportButton` (`iconOnly` prop) right-aligned using flex row with left `w-8` spacer to keep title centered
- `StatisticsClient` is a `"use client"` component owning `selectedCourse` state; all sections react to the filter
- Course filter pills: `All | East | North | West | South` — active pill uses course color or primary green for All
- Course colors: North=#10b981 (emerald), South=#f43f5e (rose), East=#3b82f6 (blue), West=#f59e0b (amber) — matches score input form tiles
- Summary cards (3-col mobile / 6-col desktop, `p-3`): Rounds · Avg Score · Best Round (green) · Worst Round (red) · Median · Active Players
- Player profiles CTA (compact single-row card, `py-2.5`) appears after summary cards, links to `/players`
- Section order: Score Trends → Course Breakdown (All only) → Score Distribution → Top 5 Best Rounds → footer note
- Footer note: styled box (`rounded-lg border bg-muted/40 px-4 py-3`) with bolded "course filters at the top"
- Top 5 Best Rounds table: muted uppercase header, columns: # · Player · Course (color-coded) · Date · Score (green)
- Course Breakdown: 4 tiles (2x2 → 4-col), sorted easiest→hardest by avg score; shows avg score + best round + total rounds; visible on "All" only
- Score Distribution: horizontal bar chart (layout="vertical"), score ranges on Y-axis (low/green at bottom, high/red at top); color-coded green→red per bucket; visually aligned with Score Trends Y-axis
- Score Trends: responsive line chart, filtered by selected course; title updates to "Score Trends — East" etc.
  - All viewports: individual player lines (thin, mobile 55% / desktop 35% opacity) as background context + bold League Avg on top
  - Mobile: subtitle caption shown; no legend. Desktop: compact legend shown
  - Linear regression trendline on League Avg: dashed green line (strokeDasharray="6 3", 50% opacity)
  - Chart height: `h-[280px] sm:h-[400px]`; x-axis tick density adapts (~5 mobile, ~10 desktop)
  - `isMobile` detected via `useEffect` + `resize` listener
- `ScoreTrendPoint` type includes `course: string` to enable client-side filtering

## Player Profile Design

- Server page (`/players/[slug]`) fetches `getPlayerProfile()` + `getPlayerHistory()`, passes to `PlayerProfileClient`
- `PlayerProfileClient` is a `"use client"` component owning `selectedCourse`, `sortKey`, `sortDir` state
- Back button: orange chevron (`border-2 border-orange-400`, `rounded-2xl`, `h-16 w-9`) inline with avatar; uses `router.back()` with fallback to `/players`
- Course filter pills: `All | East | North | West | South` — same style as statistics page
- Summary cards (3-col mobile / 6-col desktop): Avg · Hdcp · Best (green) · Worst (red) · Win% · W-L-T — all recompute from `filteredHistory` when course is selected
- Section order: Score History chart → Course Breakdown tiles (All only) → Score Distribution → Round History table
- Score History chart (`PlayerHistoryChart`): per-course background lines (thin, `connectNulls`, color-coded) + bold main line + dashed linear regression trendline (same color as main line, `strokeDasharray="6 3"`, 50% opacity); `isMobile` responsive; chart height `h-[280px] sm:h-[350px]`
  - "All" selected: main key = `"Score"` (avg of day's rounds), color = `#186732`; all course lines at 40–55% opacity
  - Course selected: main key = course name, color = course color; other course lines at 15% opacity
- Course Breakdown tiles: same as statistics page (2×2 → 4-col, sorted by avg score, color-coded borders/labels, green best round); visible on "All" only
- Score Distribution: reuses `DistributionChart`, computed from `filteredHistory`
- Round History: sortable by any column (click header to sort, again to reverse; active column shows ↑/↓); columns: Date · Course (color-coded) · Tee · Score · Result; no Hdcp column

## Homepage Design

- Hero: `logo-full.png` centered on white bg (`bg-white`), padding `py-6 sm:py-10`; "Summer Tour 2025" pill badge below logo (`bg-primary/10 text-primary rounded-full`)
- CTA buttons (stacked full-width on mobile, inline on sm+): "Input Score" (primary, → /scores) + "Book a Tee Time" (outline, → external tee-on.com URL, target _blank)
- Quick Links band: dark green bg (`bg-[#186732]`), 3-col grid of icon cards (Trophy→Leaderboard, BarChart2→Statistics, Users→Players); `bg-white/10` cards with `border-white/20`, hover `bg-white/20`; subtitle text `hidden sm:block`
- Sponsors: "Proudly sponsored by:" + 5 placeholder tiles (3+2 grid); swap `<div>` for `<img>` when assets ready; store images in `/public/sponsors/`
- No leaderboard on homepage — leaderboard lives at `/leaderboard`
- Nav: Home · Leaderboard · Statistics · About Us ▼ (dropdown → Players) + "Input Score" green pill on right
- Desktop nav: all items right-aligned; Input Score is a `rounded-full bg-primary` pill; Admin shield icon after pill
- Mobile nav: Input Score pill visible in header bar; hamburger opens sheet with Home · Leaderboard · Statistics · Players · Input Score, then Admin (with shield icon) at bottom separated by a border-t divider
- Rank medal colors: #1 gold (`text-yellow-500`), #2 silver (`text-slate-400`), #3 bronze (`text-amber-600`)
- Leaderboard table: dark green header, Best=green, Worst=red, W/L/T header (gray values), Win% column: color-coded number + slim bar underneath (`h-1 w-12 rounded-full`, `gap-px`); bar color matches text (green/orange/red)
- Mobile cards: `px-3 py-3` padding, `gap-2` between cards, `Card py-0` + `shadow-md hover:shadow-lg`; top row: rank circle (top-3 gold/silver/bronze) · name · Social badge inline · Hdcp + avg right-aligned; stat row (`text-[13px]`): left=GP · Best {green number} · Worst {red number}, right=W-L-T (gray) · Win% (color-coded ≥60% green, ≥30% orange, <30% red)

## Leaderboard Page Design

- Route: `/leaderboard`
- Heading: "Leaderboard" in Dancing Script font (`style={{ fontFamily: "var(--font-dancing-script)" }}`)
- Decorative divider below heading: 3-part flex row — gradient line (transparent→primary/60) · solid pill (`h-1 w-12 rounded-full bg-primary`) · gradient line (primary/60→transparent) — same pattern reused on Statistics and Players pages
- Desktop: `LeaderboardTable`; Mobile: `LeaderboardCard` list
- ISR 5-min revalidation (`export const revalidate = 300`)
