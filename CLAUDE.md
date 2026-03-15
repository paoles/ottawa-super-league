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
- Score page heading: Dancing Script `text-4xl font-bold text-primary` + green decorative divider; stepper uses `React.Fragment` with `h-0.5 flex-1` connector lines between circles (gray=upcoming, green=completed)
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
  - Chart margin: `{left: -8, right: 20, bottom: -8}`; YAxis `width={30}`; tick fontSize `isMobile ? 11 : 13`
- Section card titles: `text-lg font-medium`
- `ScoreTrendPoint` type includes `course: string` to enable client-side filtering

## About Pages Design

- Routes: `/history`, `/course`, `/rules`, `/contact`
- Each page uses Dancing Script heading + green decorative divider (same pattern as Leaderboard/Statistics/Players)
- Page headings match nav labels: "The Players", "Our History", "The Course", "Our Rules", "Contact Us"
- No ISR needed (static pages)

## Course Page Design

- Route: `/course`
- Static page (no DB)
- Heading: "The Course" (Dancing Script + green decorative divider)
- Sections (top to bottom):
  1. Meadows Logo — centered `next/image`, `max-w-[200px] sm:max-w-[260px]`, `priority`; src `/course/Meadows%20Logo.png`
  2. Hero Carousel (`src/components/course/hero-carousel.tsx`) — client component; crossfade (`transition-opacity duration-1000`), auto-rotate 5s; images stacked `absolute inset-0` with `opacity-100`/`opacity-0`; container `h-[220px] sm:h-[360px] rounded-xl overflow-hidden`; dot navigation at bottom; images hardcoded in page as `HERO_IMAGES` array from `/course/hero/`
  3. Description — `max-w-2xl text-center text-muted-foreground`
  4. CTA Buttons — stacked mobile / inline sm+; "Course Website" (primary) → `https://themeadowsgolf.ca/meadows`; "Book a Tee Time" (outline) → tee-on.com URL
  5. "The Four Nines" — Dancing Script `text-3xl font-bold text-foreground` heading; `grid-cols-2 sm:grid-cols-4 gap-3`; display order: North, West, South, East; each card `rounded-xl border-2 p-4 text-center` with course color border; shows Par 36, White tee row (`bg-muted/40`), Blue tee row (`bg-blue-50`, `text-blue-600`); data from `COURSE_RATINGS`/`PAR` in `constants.ts`
  6. Course Layout — Dancing Script `text-3xl font-bold text-foreground` heading; `Map v4.png` in `mx-auto max-w-2xl rounded-xl border overflow-hidden`, `object-contain`; capped at max-w-2xl to prevent blurring on desktop
  7. Course Location — Dancing Script `text-3xl font-bold text-foreground` heading; Google Maps iframe, satellite view (`!5e1` in pb param), correct pin at The Meadows (coords: 45.3315279, -75.5654473; place ID `0x4cce0bcafc869d75:0x65d2dafaca658722`); `h-[300px] sm:h-[400px]`

## History Page Design

- Route: `/history`
- Static page (no DB) — all champion data hardcoded in `page.tsx`
- Winner images: `/public/winners/{tournament}/{year}.png` (URL-encoded: `%20` for spaces)
- Three sections: **Tour Champions** (2019–2025) · **M.Q. Invitational Champions** (2020–2025) · **O.S. Classic Champions** (2025)
- Section heading: Dancing Script `text-3xl font-bold text-foreground` (no green divider under sections)
- `ChampionCard`: `rounded-2xl overflow-hidden`, square `aspect-square`, `next/image` with `fill object-cover object-top`; caption bar below with name (`text-sm font-semibold`) + year (`text-xs text-muted-foreground`); hover: `group-hover:scale-105` zoom + shadow lift
- Grid: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4`; `mt-5` between heading and grid
- First 2 cards in each section use `priority={true}` for LCP optimization
- Section spacing: `mt-14` between sections

## Players Directory Design

- Route: `/players`
- Data: `getPlayersWithStats()` returns id, name, slug, isSocial, photoUrl, gp, strokeAvg, hdcpAvg, bestRound, rank
- Sort: alphabetical (`a.name.localeCompare(b.name)`)
- Grid: 2-col mobile / 3-col sm / 4-col lg; `gap-3`
- `PlayerCard`: portrait profile tile (`h-full`, `shadow-md hover:shadow-lg`, `relative`)
  - Social badge: `absolute top-2 right-2 z-10`, gray style (`border-gray-300 bg-gray-100 text-gray-600`), compact (`px-1 py-px text-[11px]`); Commissioner badge: same position, golden circle (`h-5 w-5 rounded-full bg-yellow-400 text-white font-bold`) for slug="nico-paoletti" only
  - Avatar: `h-20 w-20` rounded-full with `ring-2 ring-primary/20`; profile photo or green initials (`text-xl font-bold`)
  - Name: `text-base font-semibold` centered below avatar
  - Stats strip (border-t): GP · Avg · Hdcp · Rank — plain uniform text, no color coding; unranked shows "—"
  - No rounds: "No rounds played" in muted text
- ISR 5-min revalidation

## Player Profile Design

- Server page (`/players/[slug]`) fetches `getPlayerProfile()` + `getPlayerHistory()`, passes to `PlayerProfileClient`
- `PlayerProfileClient` is a `"use client"` component owning `selectedCourse`, `sortKey`, `sortDir` state
- Back button: orange chevron (`border-2 border-orange-400`, `rounded-2xl`, `h-16 w-9`) inline with avatar; uses `router.back()` with fallback to `/players`
- Avatar: `h-16 w-16` rounded-full with `ring-2 ring-primary/20`; shows `profile.photoUrl` via `<Image>` (`object-cover object-top`) when available, falls back to green initials
- Course filter pills: `All | East | North | West | South` — same style as statistics page
- Summary cards (3-col mobile / 6-col desktop): Avg · Hdcp · Best (green) · Worst (red) · Win% · W-L-T — all recompute from `filteredHistory` when course is selected
- Section order: Score History chart → Course Breakdown tiles (All only) → Score Distribution → Round History table
- Score History chart (`PlayerHistoryChart`): per-course background lines (thin, `connectNulls`, color-coded) + bold main line + dashed linear regression trendline (same color as main line, `strokeDasharray="6 3"`, 50% opacity); `isMobile` responsive; chart height `h-[280px] sm:h-[350px]`; chart margin `{left: -8, right: 20, bottom: -8}`; YAxis `width={30}`; tick fontSize `isMobile ? 11 : 13`
  - "All" selected: main key = `"Score"` (avg of day's rounds), color = `#186732`; all course lines at 40–55% opacity
  - Course selected: main key = course name, color = course color; other course lines at 15% opacity
- Course Breakdown tiles: same as statistics page (2×2 → 4-col, sorted by avg score, color-coded borders/labels, green best round); visible on "All" only
- Score Distribution: reuses `DistributionChart`, computed from `filteredHistory`
- Section card titles: `text-lg font-medium`
- Round History: sortable by any column (click header to sort, again to reverse; active column shows ↑/↓); columns: Date · Course (color-coded) · Tee · Score · Result; no Hdcp column

## Homepage Design

- Hero: `Landscape.png` (`/public/Home/`) as `cover` background with `bg-white/70` overlay; `logo-full.png` centered on top (`relative`, max-w-[340px] sm:max-w-[420px], `mb-3`); padding `py-4 sm:py-6`; no badge; all hero children are `relative` to render above overlay
- CTA buttons (stacked full-width on mobile, inline on sm+): "Input Score" (primary, → /scores) + "Book a Tee Time" (outline, → external tee-on.com URL, target _blank)
- Quick Links band: dark green bg (`bg-[#186732]`), 3-col grid of icon cards (Trophy→Leaderboard, BarChart2→Statistics, Users→Players); `bg-white/10` cards with `border-white/20`, hover `bg-white/20`; subtitle text `hidden sm:block`
- Sponsors: "Proudly Sponsored By" Dancing Script heading + green decorative divider + 6 sponsor logo tiles (2-col mobile / 3-col sm, `gap-3/4`); images from `/public/sponsors/`; `max-h-20/24` object-contain
- No leaderboard on homepage — leaderboard lives at `/leaderboard`
- Nav: Home · Leaderboard · Statistics · About Us ▼ (dropdown → The Players · Our History · The Course · Our Rules · Contact Us) + "Input Score" green pill on right
- Desktop nav: all items right-aligned; Input Score is a `rounded-full bg-primary` pill; Admin shield icon after pill
- Mobile nav: Input Score pill visible in header bar; hamburger opens sheet with Home · Leaderboard · Statistics · About Us ▼ (collapsible, chevron, indented sub-links) · Input Score pill (mx-4 rounded-full); all nav items use mx-4 for side whitespace; Admin pinned to bottom with mt-auto border-t
- Rank medal colors: #1 gold (`text-yellow-500`), #2 silver (`text-slate-400`), #3 bronze (`text-amber-600`)
- Leaderboard table: dark green header, Best=green, Worst=red, W/L/T header (gray values), Win% column: color-coded number + slim bar underneath (`h-1 w-12 rounded-full`, `gap-px`); bar color matches text (green/orange/red)
- Mobile cards: `px-3 py-3` padding, `gap-2` between cards, `Card py-0` + `shadow-md hover:shadow-lg`; top row: rank circle (top-3 gold/silver/bronze) · name · Social badge inline · Hdcp + avg right-aligned; stat row (`text-[13px]`): left=GP · Best {green number} · Worst {red number}, right=W-L-T (gray) · Win% (color-coded ≥60% green, ≥30% orange, <30% red)

## Leaderboard Page Design

- Route: `/leaderboard`
- Heading: "Leaderboard" in Dancing Script font (`style={{ fontFamily: "var(--font-dancing-script)" }}`)
- Decorative divider below heading: 3-part flex row — gradient line (transparent→primary/60) · solid pill (`h-1 w-12 rounded-full bg-primary`) · gradient line (primary/60→transparent) — same pattern reused on Statistics and Players pages
- Desktop: `LeaderboardTable`; Mobile: `LeaderboardCard` list
- ISR 5-min revalidation (`export const revalidate = 300`)
- Footer hints (below table/cards): muted text with User icon → "Click a player name to view their individual statistics"; pill link → `/statistics` "View full league statistics" (`rounded-full border border-primary/30 bg-primary/5`)

## Footer

- `border-t bg-muted/30`, centered copyright text `text-sm text-muted-foreground`; copyright year: 2019
