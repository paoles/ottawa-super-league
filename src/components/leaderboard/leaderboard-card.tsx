import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import type { LeaderboardRow } from "@/types";

interface LeaderboardCardProps {
  row: LeaderboardRow;
}

function rankBadgeClass(rank: number | null): string {
  if (rank === 1) return "bg-yellow-100 text-yellow-600 border border-yellow-400";
  if (rank === 2) return "bg-slate-100 text-slate-500 border border-slate-400";
  if (rank === 3) return "bg-amber-100 text-amber-700 border border-amber-500";
  return "bg-primary/10 text-primary";
}

export function LeaderboardCard({ row }: LeaderboardCardProps) {
  if (row.gp === 0) return null;

  return (
    <Link href={`/players/${row.slug}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${rankBadgeClass(row.rank)}`}>
                {row.rank ?? "—"}
              </div>
              <div>
                <p className="text-sm font-medium leading-tight">{row.name}</p>
                {row.isSocial && (
                  <span className="text-xs text-amber-700">Social</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-base font-light">{row.strokeAvg.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">Avg</p>
            </div>
          </div>

          <div className="mt-1.5 grid grid-cols-4 gap-1 text-center">
            <div>
              <p className="text-xs font-medium">{row.gp}</p>
              <p className="text-[10px] text-muted-foreground">GP</p>
            </div>
            <div>
              <p className="text-xs font-medium text-green-600">{row.bestRound}</p>
              <p className="text-[10px] text-muted-foreground">Best</p>
            </div>
            <div>
              <p className="text-xs font-medium">
                {row.wins}-{row.losses}-{row.ties}
              </p>
              <p className="text-[10px] text-muted-foreground">W-L-T</p>
            </div>
            <div>
              <p className="text-xs font-medium">{row.winPct.toFixed(0)}%</p>
              <p className="text-[10px] text-muted-foreground">Win%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
