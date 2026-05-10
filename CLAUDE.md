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
npm run db:import-past  # Idempotent import of 2023/2024 data from Past Data.xlsx
npx tsx scripts/hash-password.ts "password"  # Generate bcrypt hash for .env.local
npx tsx scripts/migrate-add-is-active.ts        # Idempotent ALTER — reads TURSO_* from env (pattern for future migrations)
npx tsx scripts/migrate-add-is-commissioner.ts  # Idempotent ALTER + sets Nico as commissioner
npx vercel env pull .env.vercel.production --environment=production  # Pull prod env vars (file is gitignored; rm when done)
```

## PWA / Icons

- Favicon + browser tab icon: `favicon-32x32.png` (32x32) + `logo-app.png` (500x500) — set via `icons.icon` array in `layout.tsx` metadata
- iOS home screen icon: `apple-touch-icon.png` (180x180) — set via `icons.apple` in `layout.tsx` metadata
- iOS app title when saved to home screen: "Super League" — set via `appleWebApp.title` in `layout.tsx` metadata
- Android home screen: `src/app/manifest.ts` — name/short_name = "Super League", icons = `icon-192.png` (192x192) + `logo-app.png` (500x500), theme_color = `#186732`, display = standalone
- Icon files in `/public/`: `logo-app.png` (500x500 source), `apple-touch-icon.png` (180x180), `icon-192.png` (192x192), `favicon-32x32.png` (32x32), `favicon-16x16.png` (16x16) — all generated from `logo-app.png` via sharp
- `logo-icon.png` lives in `/public/` — nav header display logo (`header.tsx`), NOT used for favicon/PWA
- No `src/app/icon.png` or `favicon.ico` — metadata `icons.icon` is the sole favicon source

## Architecture

- All stats (W/L/T, leaderboard rankings, averages) computed at read time from raw score rows
- Handicap differential stored per score record (computed at insert time, never changes)
- Win/Loss/Tie auto-calculated by grouping scores by round_date (lowest score wins)
- Rendering split: `/` is ISR (5-min revalidate). `/leaderboard`, `/statistics`, `/players`, `/players/[slug]` read `searchParams.year` and are dynamic — every request hits the DB. Archive views are query-param variants of the same routes, not separate pages.
- Score submission: POST /api/scores → validates player IDs exist → DB insert → `revalidatePath("/", "/leaderboard", "/statistics", "/players", "/players/{slug}")`. Archive views are dynamic so don't need extra revalidation regardless of which season the score belongs to.
- `players.is_active` boolean (default `true`) gates whether a player appears in the Input Score picker; inactive players keep their historical scores and remain visible when an archived year is selected. Admins toggle via the edit form from `/admin/players`. Schema: `integer("is_active", { mode: "boolean" }).notNull().default(true)`
- `players.is_commissioner` boolean (default `false`) marks the current commissioner; toggled via the edit form. Schema: `integer("is_commissioner", { mode: "boolean" }).notNull().default(false)`. The commissioner receives a gold **C** circle badge on every player-facing surface (leaderboard table, leaderboard mobile cards, player directory, player profile header). When the page renders the active season, the server queries DB for `is_commissioner = true`; when it renders an archived year (`?year=2024` etc.), it looks up `SEASON_COMMISSIONERS` constant (`src/lib/constants.ts`) which maps `{ 2025: "nico-paoletti", 2024: "kevin-slack", 2023: "blair-watson" }`. All components that show the badge accept a `commissionerSlug?: string` prop — never hardcode a slug in components.
- **Self-serve player creation**: `/scores` step 3 has a dashed green "Can't find your name? Add a new player" button below the picker; opens a Dialog → POST `/api/players` (public, no auth) with `{ name }` → server forces `isSocial: true, isActive: true`, returns `{id, name}`; new player auto-selected in the form. `score-form.tsx` owns the players list in `useState` so additions appear immediately. `/api/players` POST revalidates `/scores` and `/admin/players`
- Score form: 5-step wizard (Date → Course → Players → Scores → Review); tee box set per player in step 3; step-tee.tsx is unused dead code
- Score page heading: Dancing Script `text-4xl font-bold text-primary` + green decorative divider; stepper uses `React.Fragment` with `h-0.5 flex-1` connector lines between circles (gray=upcoming, green=completed)
- Per-player tee: stored in FormData as Map<number, Tee>; API payload includes tee per player entry
- Score step: suggestions (avg±2 buttons) shown before entry; −/+ buttons shown after entry; handicap hidden (review only)
- Score success screen: two buttons — **"Same Players, New Course"** (primary, keeps `selectedPlayers` + `tees` + `roundDate`, clears `course` + `scores`, jumps to step 2 — for back nine) and **"Submit More Scores"** (outline, full reset to step 1)
- Course tile order: North/East top row, West/South bottom row
- Route groups: public pages in `src/app/(public)/` (Header/Footer layout), admin in `src/app/admin/` (AdminNav layout)

## Seasons & Archives

- Season is **derived from `roundDate`** (no schema column) — `YYYY-%` LIKE predicate via `seasonWhereClause(year)` in `src/lib/season.ts`
- `ACTIVE_SEASON` constant (default **2026**, overridable via `process.env.ACTIVE_SEASON`); `ARCHIVED_SEASONS = [2025, 2024, 2023]`
- `resolveSeasonParam(raw)` in `src/lib/season.ts` validates a `searchParams.year` value and returns either `ACTIVE_SEASON` (when missing/invalid) or one of the archived years. All four pages that take `?year=` use this helper for consistent validation — invalid years silently fall back to live.
- Every season-scoped function in `src/lib/stats.ts` accepts an optional `season?: number` (default `ACTIVE_SEASON`): `getLeaderboardData`, `getPlayerProfile`, `getPlayerHistory`, `getScoreTrends`, `getCourseBreakdowns`, `getScoreDistribution`, `getLeagueSummary`, `getPlayersWithStats`
- Cross-season aggregates (NOT season-scoped) live in the same file: `getLeagueYearlyAverages()` and `getPlayerYearlyAverages(slug)` both return `YearlyAverage[]` (`{ year, average: number | null, rounds }`) with one row per `KNOWN_SEASONS` entry (`[ACTIVE_SEASON, ...ARCHIVED_SEASONS]` sorted ascending). Years with no rounds get `average: null` so the chart's X-axis stays consistent across players. Implementation uses Drizzle `sql` aggregates: `CAST(substr(roundDate, 1, 4) AS INTEGER) AS year` + `AVG(score)` + `COUNT(*)` GROUP BY year. Player variant adds `.innerJoin(players, eq(scores.playerId, players.id)).where(eq(players.slug, slug))`. `YearlyAverage` type is exported from `src/lib/stats.ts` (not from `src/types/`).
- `getLeaderboardData` excludes 0-GP rows (historical-only players don't appear on seasons where they didn't play); `getPlayersWithStats` also filters `gp > 0`
- **Archive access is via query param, not a separate route tree.** `/leaderboard`, `/statistics`, `/players`, `/players/[slug]` each read `searchParams.year`. Live = no query param. Archive = `?year=2024` etc. There is no `/seasons/[year]/*` directory.
- **`<YearDropdown />`** (`src/components/seasons/year-dropdown.tsx`) — `"use client"` minimal inline select: `appearance-none bg-transparent text-base font-semibold text-primary` with a `ChevronDown` icon overlaid via absolute positioning. No border or pill background. Options: `"2026"`, `"2025"`, `"2024"`, `"2023"` (no "· Live" suffix). On change: pushes `pathname` (when selected = ACTIVE_SEASON, drops the query string entirely) or `${pathname}?year=${year}`. Used on all four pages, sits to the right of the page heading via `relative` parent + `absolute inset-y-0 right-0 flex items-center translate-y-1` positioning so the centered Dancing Script title isn't shifted.
- Title text stays static across years ("Leaderboard", "Statistics", "The Players", `<player name>`) — the year is only conveyed through the dropdown. Don't render `2024 Statistics` etc.
- `/players/[slug]` is dynamic (no `generateStaticParams`, no `revalidate = 300`). 404 only when `getPlayerProfile(slug, season) === null` (player slug doesn't exist anywhere). When the player exists but `gp === 0` for the selected year, `PlayerProfileClient` renders a dashed-border empty-state card ("No rounds played in this season. Use the year selector above to view another season.") in place of charts/tables. Header (avatar + name + dropdown) still renders.
- Component props for reusability:
  - `LeaderboardTable` / `LeaderboardCard`: `playerHrefSuffix?: string` (default `""`) — appended after `/players/{slug}`, e.g. `?year=2024`. Plus `commissionerSlug?: string`.
  - `PlayerCard`: `hrefSuffix?: string` (default `""`), `commissionerSlug?: string`.
  - `StatisticsClient`: only `playersHref?: string` (default `/players`). Heading, divider, and bottom archive/history pills now live in the page (`statistics/page.tsx`), not the client component. Component is body-only.
  - `PlayerProfileClient`: `backHref?: string`, `commissionerSlug?: string`. Embeds `<YearDropdown />` in its header row. Does not accept or render a season label — title is the player name regardless of year.
- Score mutation routes (`/api/scores`, `/api/admin/scores/[id]`): always revalidate the live ISR-eligible paths (`/`, `/leaderboard`, `/statistics`, `/players`, `/players/{slug}`). Archive views are dynamic so don't need explicit revalidation — they always render fresh.
- Import pipeline: `scripts/import-past-data.ts` reads 2023/2024 sheets from `Past Data.xlsx`, normalizes Meadows N/E/S/W → North/East/South/West, resolves short names via per-sheet J/K alias column map, coerces out-of-year dates to the sheet's year, recomputes handicap via `calculateHandicapDiff()`, and is idempotent (deletes existing `LIKE '2023-%' OR '2024-%'` rows before re-inserting). `(Social)` suffix in alias column K sets `isSocial: true`
- `/history` **Data Archive Links**: all 7 year pills (2025–2019) are external — 2025 → `sites.google.com/view/ottawasuperleague/home`, 2024/2023/2022/2021/2020/2019 → respective Google Sheets (bordered pill with `ExternalLink` icon, `target="_blank"`). The internal archive is reached via the per-page year dropdown — no "Browse Archive" pill on `/history` or anywhere else.

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
- Admin routes: `/admin` (dashboard with CSV export buttons), `/admin/players` (CRUD), `/admin/scores` (edit/delete)
- Admin API: POST `/api/admin/players`, PUT/DELETE `/api/admin/players/[id]`, PUT/DELETE `/api/admin/scores/[id]`
- Player delete blocked if player has scores (409 Conflict)
- Score edit recalculates handicap differential automatically
- Admin Players list (`src/app/admin/players/page.tsx`): compact table with Name / GP / Edit·Delete columns; no inline Active toggle. Name cell shows circle pills: gold **C** (`border-yellow-400 text-yellow-500`) for commissioner, green **S** (`border-primary/40 bg-primary/10 text-primary`) for Social, muted **×** icon (`border-muted-foreground/30 bg-muted`) for inactive. Inactive rows render at `opacity-60`. Active/Commissioner toggled via edit form only.
- `PlayerForm` (`src/components/admin/player-form.tsx`) has "Active this season" + "Commissioner" switches on create/edit; `playerCreateSchema` / `playerUpdateSchema` in `src/lib/validations.ts` both require `isActive: boolean` and `isCommissioner: boolean`
- Public `/api/players` route: GET returns `{id, name}[]`; POST accepts `{ name }` (validated by `publicPlayerCreateSchema`), no auth, always creates as Social + Active

## Production & Deployment

- Hosted on Vercel (project `ottawa-super-league`, team `paoles-projects-259efc15`, project ID in `.vercel/project.json`); domain `ottawasuperleague.vip` + `www.ottawasuperleague.vip`; region `iad1`
- Production DB: Turso cloud (`libsql://ottawa-super-league-paoles.aws-us-east-2.turso.io`); env vars `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` + `ADMIN_PASSWORD_HASH` + `ADMIN_SESSION_SECRET` set on Vercel production
- `.env.local` points at the local SQLite file (`file:./data/osl.db`); to run scripts against prod Turso, pull prod env first:
  ```bash
  npx vercel env pull .env.vercel.production --environment=production
  export $(grep -E "^TURSO_(DATABASE_URL|AUTH_TOKEN)=" .env.vercel.production | sed 's/"//g' | xargs -d '\n')
  # run your script
  rm .env.vercel.production
  ```
  The pulled file is gitignored but ALWAYS delete it when done.
- **Schema migrations to Turso**: `drizzle-kit push` doesn't load `.env.local`, and pushing silently can diverge dev from prod. Use ad-hoc idempotent `@libsql/client` scripts that PRAGMA-check before altering — `scripts/migrate-add-is-active.ts` is the canonical pattern (reads `PRAGMA table_info(<table>)`, no-ops if the column is already there, safe to re-run). Dev + prod must both get the migration; forgetting prod = build failure (`SQL_INPUT_ERROR: no such column: ...`)
- **Archive pages are dynamic**, so the old "prerender-before-data" gotcha no longer bites for `?year=` views — they always render against fresh DB state. The homepage `/` is still ISR (5-min revalidate); after data imports it picks up automatically on the next revalidation tick.
- **Canonical deployment order for schema-changing + data-importing releases**:
  1. Run the ALTER TABLE migration against prod Turso (pulled env + idempotent script)
  2. `git push` — Vercel build will now find the schema it expects
  3. Wait for build READY
  4. Run the data import against prod Turso (`TURSO_*= npm run db:import-past`)
  5. Delete the pulled env file
- Verify prod data landed with a direct curl probe: `curl -sL "https://ottawasuperleague.vip/leaderboard?year=2024" | grep -oE "Kevin Slack|hasn't started yet"` — presence of the latter means the import didn't land or the env var pointed elsewhere

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
- "Active" is an admin-managed per-player flag; controls visibility in the Input Score picker only. Does **not** affect leaderboard/stats/archive pages (those still use score presence). Manually re-toggled each season; new players created from the public score form are Active + Social by default
- Unique constraint: one score per player per course per date

## Conventions

- All chart components must be 'use client' wrappers (Recharts requires browser APIs)
- Use `z.number()` with `valueAsNumber: true` in forms (not `z.coerce.number()`)
- CSS variables use oklch color space for the shadcn/ui theme
- Primary green: oklch(0.4 0.12 145) ≈ #186732
- Set cookies in Route Handlers via `response.cookies.set()` on the `NextResponse` object, NOT via `cookies()` from `next/headers`

## Statistics Page Design

- Server page (`statistics/page.tsx`) reads `searchParams.year` via `resolveSeasonParam`, fetches `getScoreTrends(season)` + `getCourseBreakdowns(season)` + `getLeagueYearlyAverages()` (NOT season-scoped — pulls all years), renders heading row (`<h1>Statistics</h1>` + `<YearDropdown />`) + green divider + `<StatisticsClient />` body + footer "Our History" pill
- Heading lives in the page, not the client component — `StatisticsClient` is body-only and starts at the course filter pills
- `StatisticsClient` is a `"use client"` component owning `selectedCourse` state; all sections except Season Averages by Year react to the course filter; props are `{ trends, courseBreakdowns, yearlyAverages, selectedYear, playersHref }`
- Course filter pills: `All | North | East | West | South` — active pill uses course color or primary green for All
- Course colors: North=#10b981 (emerald), South=#f43f5e (rose), East=#3b82f6 (blue), West=#f59e0b (amber) — matches score input form tiles
- Summary cards (3-col mobile / 6-col desktop, `p-3`): Rounds · Avg Score · Best Round (green) · Worst Round (red) · Median · Active Players
- Player profiles CTA (compact single-row card, `py-2.5`, `mb-6`) appears after summary cards, links to `playersHref` (`/players` for live, `/players?year=YYYY` for archive)
- Section order: Season History → Course Breakdown (All only) → Score Distribution → Top 5 Best Rounds → Season Averages by Year → footer note. The "Our History" pill below the body lives in the page wrapper.
- Footer note: styled box (`rounded-lg border bg-muted/40 px-4 py-3`) with bolded "course filters at the top"
- Top 5 Best Rounds table: muted uppercase header, columns: # · Player · Course (color-coded) · Date · Score (green)
- Course Breakdown: 4 tiles (2x2 → 4-col), sorted easiest→hardest by avg score; shows avg score + best round + total rounds; visible on "All" only
- Score Distribution: horizontal bar chart (layout="vertical"), score ranges on Y-axis (low/green at bottom, high/red at top); color-coded green→red per bucket; visually aligned with Season History Y-axis
- Season History (renamed from "Score Trends"): responsive line chart of within-season league averages, filtered by selected course; title updates to "Season History — East" etc. (no suffix on "All")
  - All viewports: individual player lines (thin, mobile 55% / desktop 35% opacity) as background context + bold League Avg on top
  - Mobile: subtitle caption shown; no legend. Desktop: compact legend shown
  - Linear regression trendline on League Avg: dashed green line (strokeDasharray="6 3", 50% opacity)
  - Chart height: `h-[280px] sm:h-[400px]`; x-axis tick density adapts (~5 mobile, ~10 desktop)
  - `isMobile` detected via `useEffect` + `resize` listener
  - Chart margin: `{left: -8, right: 20, bottom: -8}`; YAxis `width={30}`; tick fontSize `isMobile ? 11 : 13`
- Season Averages by Year: cross-season `<YearlyAveragesChart />` (in `src/components/charts/`); always shows one bar per known season (2023–2026) regardless of `selectedCourse`; selected year rendered in solid `#186732`, others muted to `#18673259`. Bar values labeled on top via `<LabelList>`; tooltip reads `Avg X.X · N rounds` (or "No rounds played" when null). Y-axis domain computed from data (`[floor(min)-4, ceil(max)+2]`) so the smallest bar still has visible height. `average` is null for years with no rounds — Recharts skips the bar entirely, but the year label still appears on the X-axis. Card height `h-[220px] sm:h-[280px]`. The chart never filters by course — pure season-to-season comparison.
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
  5. "The Four Nines" — Dancing Script `text-3xl font-bold text-foreground` heading; `grid-cols-2 sm:grid-cols-4 gap-3`; display order: North, East, West, South; each card `rounded-xl border-2 p-4 text-center` with course color border; shows Par 36, White tee row (`bg-muted/40`), Blue tee row (`bg-blue-50`, `text-blue-600`); data from `COURSE_RATINGS`/`PAR` in `constants.ts`
  6. Course Layout — Dancing Script `text-3xl font-bold text-foreground` heading; `Map v4.png` in `mx-auto max-w-2xl rounded-xl border overflow-hidden`, `object-contain`; capped at max-w-2xl to prevent blurring on desktop
  7. Course Location — Dancing Script `text-3xl font-bold text-foreground` heading; Google Maps iframe, satellite view (`!5e1` in pb param), correct pin at The Meadows (coords: 45.3315279, -75.5654473; place ID `0x4cce0bcafc869d75:0x65d2dafaca658722`); `h-[300px] sm:h-[400px]`

## Rules Page Design

- Route: `/rules`
- Static page (no DB, no ISR)
- Heading: "Our Rules" (Dancing Script + green decorative divider)
- Intro paragraph: centered `max-w-2xl text-muted-foreground`, explains AGM process
- Rule data: `RULES_SECTIONS` array at top of file, each with `title` + `rules: { name, text }[]`
- 4 section Cards stacked in `max-w-3xl` container with `space-y-6`:
  1. **General Play** (4 rules): Eligible Course, Eligible Tees, Round Declaration, Conceded Putts
  2. **Relief & Drops** (7 rules): OB/White Stakes, Lost Ball (3-min search), Red Penalty Areas, Obstruction Relief (Trees), Embedded Ball in Fairway Divot, Casual Water, General Drop Disputes
  3. **Scoring & Rankings** (5 rules): Maximum Score (double par +1, excludes tournaments), Handicap Index formula, Match Results (W/L/T determination), Tournament Tie-Break (putting competition at North/West green), League Ranking (10-round minimum)
  4. **Governance** (3 rules): AGM voting, Social Membership ($10 annual fee for full membership, social can compete/win but no AGM vote), Commissioner Authority
- Section titles: Dancing Script `text-2xl font-bold text-foreground` with `WebkitTextStroke: "0.6px currentColor"`
- Rules: `<ol className="list-none">` with `flex gap-2` list items; number (`sectionIdx+1.ruleIdx+1`) in `shrink-0 text-sm tabular-nums leading-relaxed` span (not bold) + content span; hierarchical numbering e.g. 1.1, 2.3
- Footer note: `rounded-lg border bg-muted/40 px-4 py-3` with bolded "Note:" about amendment process
- Imports: Card, CardHeader, CardTitle, CardContent from shadcn/ui

## Contact Page Design

- Route: `/contact`
- Static page (no DB, no ISR)
- Heading: "Contact Us" (Dancing Script + green decorative divider)
- Two sections below heading:
  1. **Join the League** — `max-w-3xl mx-auto`; 2-col grid on sm+ (stacked mobile)
     - Left: group photo (`/contact/group.jpg`) in `aspect-video rounded-xl overflow-hidden`, `next/image` with `fill object-cover`
     - Right: Dancing Script `text-3xl` heading "Join the league!" + body text with `mailto:` link to `ottawasuperleague.vip@gmail.com` (primary color, underlined) + bold "Follow us via the link below:" + Instagram SVG icon (`h-10 w-10`) linking to `https://www.instagram.com/ottawasuperleague/` (new tab)
     - Instagram icon: inline SVG with radialGradient (yellow→red→purple→blue), white camera outline
  2. **Commissioner's Memorial Hall** — `mt-16`; Dancing Script `text-3xl` centered heading
     - `COMMISSIONERS` array: Nico Paoletti (2025–Present), Kevin Slack (2024), Blair Watson (2019–2023)
     - 3-col grid on sm+ (`max-w-3xl mx-auto`, `gap-4`); cards match ChampionCard from `/history` (rounded-2xl, aspect-square image with hover zoom, name `text-lg font-semibold` + years below)
     - Images: `/contact/nico.JPG`, `/contact/kevin.jpg`, `/contact/blair.jpg`

## History Page Design

- Route: `/history`
- Static page (no DB) — all champion data hardcoded in `page.tsx`
- Winner images: `/public/winners/{tournament}/{year}.png` (URL-encoded: `%20` for spaces)
- **Data Archive Links** (immediately below heading/divider): "Data Archive Links" muted caption + pill grid 2025–2019 in two rows (4 on top: 2025–2022, 3 on bottom: 2021–2019). `PAST_SEASONS` entries are all external `<a target="_blank">` to original Google resources (bordered pill with `ExternalLink` icon) — 2025 → `sites.google.com/view/ottawasuperleague/home`, 2024–2019 → their respective Google Sheets. The internal archive is reached via the year dropdown on `/leaderboard`, `/statistics`, `/players` — no Browse Archive pill on this page.
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
  - Social badge: `absolute top-2 right-2 z-10`, gray style (`border-gray-300 bg-gray-100 text-gray-600`), compact (`px-1 py-px text-[11px]`); Commissioner badge: same position, outlined gold circle (`h-5 w-5 rounded-full border-2 border-yellow-400 text-yellow-500`) when `slug === commissionerSlug` (the prop, not a hardcoded slug). C badge takes priority over Social.
  - Avatar: `h-20 w-20` rounded-full with `ring-2 ring-primary/20`; profile photo or green initials (`text-xl font-bold`)
  - Name: `text-base font-semibold` centered below avatar
  - Stats strip (border-t): GP · Avg · Hdcp · Rank — plain uniform text, no color coding; unranked shows "—"
  - No rounds: "No rounds played" in muted text
  - `hrefSuffix` prop (default `""`) is appended to `/players/{slug}` so archive views link to `/players/{slug}?year=YYYY`
- Page is dynamic (reads `searchParams.year`); not ISR

## Player Profile Design

- Server page (`/players/[slug]`) reads `searchParams.year` via `resolveSeasonParam`, fetches `getPlayerProfile(slug, season)` + `getPlayerHistory(slug, season)` + `getPlayerYearlyAverages(slug)` (NOT season-scoped — pulls all years), passes to `PlayerProfileClient`. Resolves `commissionerSlug` from DB (live) or `SEASON_COMMISSIONERS[season]` (archive). `backHref` = `/players` (live) or `/players?year={season}` (archive).
- 404 only when `getPlayerProfile` returns `null` (slug missing entirely). Player exists but `gp === 0` for the selected year → render empty-state card, never 404.
- Page is dynamic — no `generateStaticParams`, no `revalidate`
- `PlayerProfileClient` is a `"use client"` component owning `selectedCourse`, `sortKey`, `sortDir` state; embeds `<YearDropdown />` in the header row; props are `{ profile, history, yearlyAverages, selectedYear, backHref?, commissionerSlug? }`
- Header row (flex): orange chevron back button → avatar → name+badges+rank → `<YearDropdown />` (right-aligned via `shrink-0` on a wrapper div)
- Back button: orange chevron (`border-2 border-orange-400`, `rounded-2xl`, `h-16 w-9`); uses `router.back()` with fallback to `backHref` prop
- Avatar: `h-16 w-16` rounded-full with `ring-2 ring-primary/20`; shows `profile.photoUrl` via `<Image>` (`object-cover object-top`) when available, falls back to green initials
- Empty state (rendered when `profile.gp === 0`): dashed-border `Card` with muted background, "No rounds played in this season." headline + "Use the year selector above to view another season." subtext. Replaces season-scoped sections (course pills, summary cards, Season History chart, Course Breakdown, Score Distribution, Round History). The Season Averages by Year chart still renders below the empty-state card so historical context remains visible. Header always renders so the user can switch years.
- Course filter pills: `All | North | East | West | South` — same style as statistics page
- Summary cards (3-col mobile / 6-col desktop): Avg · Hdcp · Best (green) · Worst (red) · Win% · W-L-T — all recompute from `filteredHistory` when course is selected
- Section order: Season History chart → Course Breakdown tiles (All only) → Score Distribution → Round History table → Season Averages by Year
- Season History chart (renamed from "Score History"; `PlayerHistoryChart`): per-course background lines (thin, `connectNulls`, color-coded) + bold main line + dashed linear regression trendline (same color as main line, `strokeDasharray="6 3"`, 50% opacity); `isMobile` responsive; chart height `h-[280px] sm:h-[350px]`; chart margin `{left: -8, right: 20, bottom: -8}`; YAxis `width={30}`; tick fontSize `isMobile ? 11 : 13`. Title reads "Season History" with `— {Course}` suffix when a course pill is active.
  - "All" selected: main key = `"Score"` (avg of day's rounds), color = `#186732`; all course lines at 40–55% opacity
  - Course selected: main key = course name, color = course color; other course lines at 15% opacity
- Course Breakdown tiles: same as statistics page (2×2 → 4-col, sorted by avg score, color-coded borders/labels, green best round); visible on "All" only
- Score Distribution: reuses `DistributionChart`, computed from `filteredHistory`
- Season Averages by Year: same `<YearlyAveragesChart />` component used on the statistics page, fed `getPlayerYearlyAverages(slug)`. Renders one bar per known season (2023–2026) with the player's per-year avg score; selected year highlighted in `#186732`, others muted. Renders in BOTH the empty-state and populated branches so a player who skipped the current season still shows their historical averages.
- Section card titles: `text-lg font-medium`
- Round History: sortable by any column (click header to sort, again to reverse; active column shows ↑/↓); columns: Date · Course (color-coded) · Tee · Score · Result; no Hdcp column

## Homepage Design

- Hero: `Landscape.png` (`/public/home/`) as `cover` background with `bg-white/70` overlay; `logo-full.png` centered on top (`relative`, max-w-[340px] sm:max-w-[420px], `mb-3`); padding `py-4 sm:py-6`; no badge; all hero children are `relative` to render above overlay
- CTA buttons (stacked full-width on mobile, inline on sm+): "Input Score" (primary, → /scores) + "Book a Tee Time" (outline, → external tee-on.com URL, target _blank)
- Quick Links band: dark green bg (`bg-[#186732]`), 3-col grid of icon cards (Trophy→Leaderboard, BarChart2→Statistics, Users→Players); `bg-white/10` cards with `border-white/20`, hover `bg-white/20`; subtitle text `hidden sm:block`
- Sponsors: "Proudly Sponsored By" Dancing Script heading + green decorative divider + 6 sponsor logo tiles (2-col mobile / 3-col sm, `gap-3/4`); images from `/public/sponsors/`; `max-h-20/24` object-contain
- No leaderboard on homepage — leaderboard lives at `/leaderboard`
- Nav: Home · Leaderboard · Statistics · About Us ▼ (dropdown → The Players · Our History · The Course · Our Rules · Contact Us) + "Input Score" green pill on right
- Desktop nav: all items right-aligned; Input Score is a `rounded-full bg-primary` pill; Admin shield icon after pill
- Mobile nav: Input Score pill visible in header bar; hamburger opens sheet with Home · Leaderboard · Statistics · About Us ▼ (collapsible, chevron, indented sub-links) · Input Score pill (mx-4 rounded-full); all nav items use mx-4 for side whitespace; Admin pinned to bottom with mt-auto border-t
- **Year-aware nav links**: `header.tsx` reads `?year=` via `useSearchParams`; Leaderboard, Statistics, and The Players links get `?year=YYYY` appended when an archived year is active, so the selected season persists when switching between those pages. Home, Input Score, About Us sub-links (except The Players), and Admin never carry the year param.
- Rank medal colors: #1 gold (`text-yellow-500`), #2 silver (`text-slate-400`), #3 bronze (`text-amber-600`)
- Leaderboard table: dark green header, Best=green, Worst=red, W/L/T color-coded (wins=green, losses=red, ties=muted), Win% column: color-coded number + `h-1.5 w-12` bar; bar color matches text (green/orange/red); rank column uses medal circle badges for top 3 (yellow/slate/amber), plain muted number for 4+, `—` for unranked; `even:bg-muted/20` zebra striping; unranked rows `opacity-80`; separator row "UNRANKED — 10 ROUNDS REQUIRED" between ranked and unranked sections; Stroke Avg `font-semibold`
- Mobile cards: `px-3 py-3` padding, `gap-2` between cards, `Card py-0` + `shadow-md hover:shadow-lg`; top row: rank circle (top-3 gold/silver/bronze) · name · Social badge inline · Hdcp + avg right-aligned; stat row (`text-[13px]`): left=GP · Best {green number} · Worst {red number}, right=W-L-T (gray) · Win% (color-coded ≥60% green, ≥30% orange, <30% red)

## Leaderboard Page Design

- Route: `/leaderboard` (live) and `/leaderboard?year=YYYY` (archive — same page)
- Heading: "Leaderboard" in Dancing Script font (`style={{ fontFamily: "var(--font-dancing-script)" }}`); inside a `relative` wrapper with `<YearDropdown />` absolutely positioned right
- Decorative divider below heading: 3-part flex row — gradient line (transparent→primary/60) · solid pill (`h-1 w-12 rounded-full bg-primary`) · gradient line (primary/60→transparent) — same pattern reused on Statistics and Players pages
- Desktop: `LeaderboardTable`; Mobile: `LeaderboardCard` list. Both accept `playerHrefSuffix` from the page so player links carry the active `?year=` when archived.
- Page is dynamic (reads `searchParams.year`); not ISR
- Footer hints (below table/cards): muted text with User icon → "Click a player name to view their individual statistics"; pill link → `/statistics` (or `/statistics?year=YYYY`) "View full league statistics" + "Our History" pill → `/history`

## Footer

- `border-t bg-muted/30`, centered copyright text `text-sm text-muted-foreground`; copyright year: 2019
