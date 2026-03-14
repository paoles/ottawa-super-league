import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { LeaderboardRow } from "@/types";

interface LeaderboardTableProps {
  data: LeaderboardRow[];
}

function WinPctBar({ pct }: { pct: number }) {
  const textColor = pct >= 60 ? "text-green-600" : pct >= 30 ? "text-orange-500" : "text-red-500";
  const barColor = pct >= 60 ? "bg-green-600" : pct >= 30 ? "bg-orange-500" : "bg-red-500";

  return (
    <div className="flex flex-col items-center gap-px">
      <span className={`text-sm font-semibold ${textColor}`}>{pct.toFixed(0)}%</span>
      <div className="h-1 w-12 rounded-full bg-muted">
        <div className={`h-1.5 rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}


function rankColor(rank: number | null): string {
  if (rank === 1) return "text-yellow-500 font-bold";
  if (rank === 2) return "text-slate-400 font-bold";
  if (rank === 3) return "text-amber-600 font-bold";
  return "text-muted-foreground";
}

export function LeaderboardTable({ data }: LeaderboardTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="bg-primary hover:bg-primary">
            <TableHead className="w-10 text-center text-xs font-semibold uppercase tracking-wide text-primary-foreground">#</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wide text-primary-foreground">Player</TableHead>
            <TableHead className="text-center text-xs font-semibold uppercase tracking-wide text-primary-foreground">GP</TableHead>
            <TableHead className="text-center text-xs font-semibold uppercase tracking-wide text-primary-foreground">Stroke Avg</TableHead>
            <TableHead className="text-center text-xs font-semibold uppercase tracking-wide text-primary-foreground">Hdcp</TableHead>
            <TableHead className="text-center text-xs font-semibold uppercase tracking-wide text-primary-foreground">Best</TableHead>
            <TableHead className="text-center text-xs font-semibold uppercase tracking-wide text-primary-foreground">Worst</TableHead>
            <TableHead className="text-center text-xs font-semibold uppercase tracking-wide text-primary-foreground">W/L/T</TableHead>
            <TableHead className="text-center text-xs font-semibold uppercase tracking-wide text-primary-foreground">Win %</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.playerId} className="hover:bg-muted/30">
              <TableCell className="text-center">
                <span className={rankColor(row.rank)}>
                  {row.rank ?? "—"}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={`/players/${row.slug}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {row.name}
                  </Link>
                  {row.isSocial && (
                    <span className="rounded border border-amber-300 bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800">
                      Social
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-center">{row.gp}</TableCell>
              <TableCell className="text-center">
                {row.gp > 0 ? row.strokeAvg.toFixed(2) : "—"}
              </TableCell>
              <TableCell className="text-center">
                {row.gp > 0 ? row.hdcpAvg.toFixed(1) : "—"}
              </TableCell>
              <TableCell className="text-center font-medium text-green-600">
                {row.gp > 0 ? row.bestRound : "—"}
              </TableCell>
              <TableCell className="text-center font-medium text-red-500">
                {row.gp > 0 ? row.worstRound : "—"}
              </TableCell>
              <TableCell className="text-center text-muted-foreground">
                {row.wins}&nbsp;·&nbsp;{row.losses}&nbsp;·&nbsp;{row.ties}
              </TableCell>
              <TableCell className="text-center">
                {row.gp > 0 ? <WinPctBar pct={row.winPct} /> : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
