# Ottawa Super League - Project Plan

## Completed

### Phase 1: Core App (Done)
- [x] Project setup: Next.js 16, TypeScript, Tailwind CSS v4, shadcn/ui
- [x] Database: Drizzle ORM + libSQL (SQLite dev / Turso production)
- [x] Schema: players table, scores table
- [x] Seed data: Summer Tour 2025 (16 players, 98 scores)
- [x] Landing page with hero banner + leaderboard (table desktop, cards mobile)
- [x] Score input: 6-step mobile-first wizard form
- [x] Statistics page: summary cards + charts (trends, course breakdown, distribution)
- [x] Players directory: grid with player cards
- [x] Player profiles: stats, chart, course breakdown, round history
- [x] CSV export API (scores + leaderboard)
- [x] ISR with 5-min revalidation

### Phase 2: Admin System (Done)
- [x] Single-admin auth (bcrypt + HMAC session cookie)
- [x] Login page at `/admin/login`
- [x] Route protection via Next.js middleware
- [x] Admin dashboard with player/score counts
- [x] Player CRUD: create, edit, delete (with score protection)
- [x] Score management: edit (with handicap recalc), delete
- [x] Route groups: `(public)` with Header/Footer, `admin` with AdminNav
- [x] Shield icon admin link in public header

## Upcoming

### Phase 3: Deployment
- [ ] Set up Turso cloud database
- [ ] Deploy to Vercel
- [ ] Configure production env vars
- [ ] DNS: OttawaSuperLeague.VIP

### Phase 4: Season Features
- [ ] Season management (archive past seasons, start new)
- [ ] Schedule / upcoming rounds page
- [ ] Photo uploads for player profiles
- [ ] Push notifications for new scores

### Phase 5: Enhancements
- [ ] Head-to-head player comparison
- [ ] Handicap trend charts
- [ ] Mobile PWA support
- [ ] Dark mode
