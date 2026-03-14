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

function winPctClass(pct: number): string {
  if (pct >= 60) return "text-green-600";
  if (pct >= 30) return "text-orange-500";
  return "text-red-500";
}

export function LeaderboardCard({ row }: LeaderboardCardProps) {
  if (row.gp === 0) return null;

  return (
    <Link href={`/players/${row.slug}`}>
      <Card className="py-0">
        <CardContent className="px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${rankBadgeClass(row.rank)}`}>
                {row.rank ?? "—"}
              </div>
              <div className="flex items-center gap-1.5">
                <p className="text-base font-medium leading-tight">{row.name}</p>
                {row.isSocial && (
                  <span className="rounded border border-amber-300 bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800">Social</span>
                )}
              </div>
            </div>
            <div className="flex items-baseline gap-2 text-right">
              <span className="text-sm text-muted-foreground">Hdcp {row.hdcpAvg.toFixed(1)}</span>
              <span className="text-base font-semibold">{row.strokeAvg.toFixed(1)}<span className="ml-0.5 text-xs font-normal text-muted-foreground">avg</span></span>
            </div>
          </div>

          <p className="mt-1.5 text-base text-muted-foreground">
            {row.gp} GP · <span className="text-green-600">Best {row.bestRound}</span> · <span className="text-red-500">Worst {row.worstRound}</span> · {row.wins}-{row.losses}-{row.ties} · <span className={winPctClass(row.winPct)}>{row.winPct.toFixed(0)}%</span>
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
