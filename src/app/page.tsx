import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { LeaderboardCard } from "@/components/leaderboard/leaderboard-card";
import { CsvExportButton } from "@/components/shared/csv-export-button";
import { getLeaderboardData } from "@/lib/stats";

export const revalidate = 300;

export default async function HomePage() {
  const leaderboard = await getLeaderboardData();

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary px-4 py-12 text-center text-primary-foreground sm:py-16">
        <h1 className="text-4xl font-light tracking-tight sm:text-5xl">
          Ottawa Super League
        </h1>
        <p className="mx-auto mt-3 max-w-md text-lg font-light text-primary-foreground/80">
          Summer Tour 2025 &middot; The Meadows Golf & Country Club
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild variant="secondary" size="lg">
            <Link href="/scores">Input Score</Link>
          </Button>
          <Button asChild size="lg" className="border border-white/30 bg-transparent text-white hover:bg-white/10">
            <Link href="/statistics">View Stats</Link>
          </Button>
        </div>
      </section>

      {/* Leaderboard */}
      <section className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-light">Leaderboard</h2>
          <CsvExportButton type="leaderboard" label="Export" />
        </div>

        {/* Desktop table */}
        <div className="hidden md:block">
          <LeaderboardTable data={leaderboard} />
        </div>

        {/* Mobile cards */}
        <div className="flex flex-col gap-3 md:hidden">
          {leaderboard.map((row) => (
            <LeaderboardCard key={row.playerId} row={row} />
          ))}
        </div>
      </section>
    </div>
  );
}
