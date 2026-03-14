# Ottawa Super League - TODO

## Next Up
- [ ] Deploy to Vercel + Turso cloud
- [ ] Configure production env vars (database URL, admin hash, session secret)
- [ ] Set up DNS for OttawaSuperLeague.VIP

## Backlog
- [ ] Season management (archive/new season)
- [ ] Schedule / upcoming rounds page
- [ ] Player photo uploads (file upload vs URL)
- [ ] Head-to-head player comparison tool
- [ ] Handicap trend charts on player profiles
- [ ] Rate limiting on admin login
- [ ] Mobile PWA support (offline, install prompt)
- [ ] Dark mode toggle
- [ ] Push notifications for new scores

## Done
- [x] Score Trends chart: responsive (mobile = league avg only, desktop = individual lines + league avg)
- [x] Core app: leaderboard, score input, statistics, player profiles
- [x] Database schema + seed data (Summer Tour 2025)
- [x] Admin auth (bcrypt + HMAC session cookie)
- [x] Admin dashboard, player CRUD, score management
- [x] Route groups (public vs admin layouts)
- [x] CSV export API
- [x] Production build passing
- [x] Mobile leaderboard cards redesigned (two-row, Best/Worst/Win% color-coded, Hdcp on top row, Social badge inline)
