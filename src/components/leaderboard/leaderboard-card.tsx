import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { LeaderboardRow } from "@/types";

interface LeaderboardCardProps {
  row: LeaderboardRow;
}

export function LeaderboardCard({ row }: LeaderboardCardProps) {
  if (row.gp === 0) return null;

  return (
    <Link href={`/players/${row.slug}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {row.rank ?? "—"}
              </div>
              <div>
                <p className="font-medium">{row.name}</p>
                {row.isSocial && (
                  <Badge variant="secondary" className="mt-0.5 text-xs">
                    Social
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-light">{row.strokeAvg.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">Stroke Avg</p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-4 gap-2 text-center text-sm">
            <div>
              <p className="font-medium">{row.gp}</p>
              <p className="text-xs text-muted-foreground">GP</p>
            </div>
            <div>
              <p className="font-medium">{row.bestRound}</p>
              <p className="text-xs text-muted-foreground">Best</p>
            </div>
            <div>
              <p className="font-medium">
                {row.wins}-{row.losses}-{row.ties}
              </p>
              <p className="text-xs text-muted-foreground">W-L-T</p>
            </div>
            <div>
              <p className="font-medium">{row.winPct.toFixed(0)}%</p>
              <p className="text-xs text-muted-foreground">Win%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
