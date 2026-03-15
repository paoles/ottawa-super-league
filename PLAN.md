# Ottawa Super League - Project Plan

## Completed

### Phase 1: Core App
- [x] Project setup: Next.js 16, TypeScript, Tailwind CSS v4, shadcn/ui
- [x] Database: Drizzle ORM + libSQL (SQLite dev / Turso production)
- [x] Schema: players table, scores table
- [x] Seed data: Summer Tour 2025 (16 players, 98 scores)
- [x] Landing page with hero banner (Landscape.png bg + white/70 overlay + OSL logo) + leaderboard (table desktop, cards mobile); sponsors below leaderboard; bold leaderboard heading
- [x] Mobile leaderboard cards: two-row design — name+Social+Hdcp+avg top row; GP·Best·Worst·W-L-T·Win% stat row; color-coded Best(green)/Worst(red)/Win%
- [x] Score input: 5-step mobile-first wizard form (per-player tee, score suggestions, +/- adjust buttons)
- [x] Statistics page: summary cards + charts (trends responsive, course breakdown, distribution)
- [x] Players directory: portrait profile tiles, alphabetical sort, Social badge top-right, stats strip (GP · Avg · Hdcp · Rank)
- [x] Player profiles: course filter pills, summary cards (color-coded Best/Worst), score history chart (per-course bg lines + trendline), course breakdown tiles, score distribution, sortable round history, orange chevron back button
- [x] CSV export API (scores + leaderboard)
- [x] ISR with 5-min revalidation

### Phase 2: Admin System
- [x] Single-admin auth (bcrypt + HMAC session cookie)
- [x] Login page at `/admin/login`
- [x] Route protection via Next.js middleware
- [x] Admin dashboard with player/score counts
- [x] Player CRUD: create, edit, delete (blocked if player has scores)
- [x] Score management: edit (with handicap recalc), delete
- [x] Route groups: `(public)` with Header/Footer, `admin` with AdminNav
- [x] Shield icon admin link in public header
- [x] About Us dropdown: The Players · The History · The Course · The Rules · Contact Us (placeholder pages with Dancing Script heading + divider)
- [x] Mobile sidebar: collapsible About Us, mx-4 nav items, Input Score pill, Admin pinned to bottom
- [x] Cookie fix: set directly on `NextResponse` for reliable browser delivery

### Phase 3: Deployment
- [x] GitHub: `github.com/paoles/ottawa-super-league`
- [x] Vercel: deployed and auto-deploying on push to master
- [ ] Turso cloud database (currently using Vercel's bundled SQLite or local)
- [ ] DNS: OttawaSuperLeague.VIP

## Upcoming

### Phase 4: Season Features
- [ ] Season management (archive past seasons, start new)
- [ ] Schedule / upcoming rounds page
- [x] Player profile photos: static files in /public/players/, URLs stored in DB; 12/16 players have photos
- [ ] Push notifications for new scores

### Phase 5: Enhancements
- [ ] Head-to-head player comparison
- [x] Handicap trend charts on player profiles (score history trendline added)
- [ ] Mobile PWA support
- [ ] Dark mode
