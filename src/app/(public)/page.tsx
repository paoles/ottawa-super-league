import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { LeaderboardCard } from "@/components/leaderboard/leaderboard-card";
import { getLeaderboardData } from "@/lib/stats";

export const revalidate = 300;

const SPONSORS = [
  { name: "mycar.ca" },
  { name: "Pinpoint Solutions" },
  { name: "Freedom Convoy 2022" },
  { name: "The Business Inn & Suites" },
  { name: "The J\u2014\u2014er Quotes" },
];

export default async function HomePage() {
  const leaderboard = await getLeaderboardData();

  return (
    <div>
      {/* Hero */}
      <section className="bg-muted/30 px-4 py-4 text-center sm:py-6">
        <div className="mx-auto max-w-xs sm:max-w-sm">
          <img
            src="/logo-full.png"
            alt="Ottawa Super League"
            className="mx-auto w-full object-contain"
          />
        </div>
        <div className="mt-2 flex justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/scores">Input Score</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
            <a
              href="https://www.tee-on.com/PubGolf/servlet/com.teeon.teesheet.servlets.golfersection.ComboLanding?CourseCode=TMCC&FromCourseWebsite=true"
              target="_blank"
              rel="noopener noreferrer"
            >
              Book a Tee Time
            </a>
          </Button>
        </div>
      </section>

      {/* Leaderboard */}
      <section className="mx-auto max-w-5xl px-4 py-8">
        <h2
          className="mb-6 text-center text-4xl font-bold text-primary"
          style={{ fontFamily: "var(--font-dancing-script)" }}
        >
          Current Leaderboard
        </h2>

        {/* Desktop table */}
        <div className="hidden md:block">
          <LeaderboardTable data={leaderboard} />
        </div>

        {/* Mobile cards */}
        <div className="flex flex-col gap-1.5 md:hidden">
          {leaderboard.map((row) => (
            <LeaderboardCard key={row.playerId} row={row} />
          ))}
        </div>

        <div className="mt-6 text-center">
          <Button asChild variant="default" size="lg">
            <Link href="/statistics">More Stats</Link>
          </Button>
        </div>
      </section>

      {/* Sponsors */}
      <section className="border-y bg-white px-4 py-8 text-center">
        <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Proudly sponsored by:
        </p>
        <div className="mx-auto grid max-w-2xl grid-cols-3 gap-3">
          {SPONSORS.slice(0, 3).map((s) => (
            <div
              key={s.name}
              className="flex h-16 items-center justify-center rounded-lg border bg-muted/20 px-3 text-center text-sm font-semibold text-foreground/70"
            >
              {s.name}
            </div>
          ))}
          <div className="col-span-3 grid grid-cols-2 gap-3">
            {SPONSORS.slice(3).map((s) => (
              <div
                key={s.name}
                className="flex h-16 items-center justify-center rounded-lg border bg-muted/20 px-3 text-center text-sm font-semibold text-foreground/70"
              >
                {s.name}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
