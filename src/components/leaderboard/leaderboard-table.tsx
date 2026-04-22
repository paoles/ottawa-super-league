import React from "react";
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
  playerHrefPrefix?: string;
  commissionerSlug?: string;
}

function WinPctBar({ pct }: { pct: number }) {
  const textColor = pct >= 60 ? "text-green-600" : pct >= 30 ? "text-orange-500" : "text-red-500";
  const barColor = pct >= 60 ? "bg-green-600" : pct >= 30 ? "bg-orange-500" : "bg-red-500";

  return (
    <div className="flex flex-col items-center gap-px">
      <span className={`text-sm font-semibold ${textColor}`}>{pct.toFixed(0)}%</span>
      <div className="h-1.5 w-12 rounded-full bg-muted">
        <div className={`h-1.5 rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function RankBadge({ rank }: { rank: number | null }) {
  if (rank === null) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  if (rank === 1) {
    return (
      <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-full border border-yellow-400 bg-yellow-100 text-sm font-bold text-yellow-600">
        1
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-full border border-slate-400 bg-slate-100 text-sm font-bold text-slate-500">
        2
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-full border border-amber-500 bg-amber-100 text-sm font-bold text-amber-700">
        3
      </div>
    );
  }
  return <span className="text-sm text-muted-foreground">{rank}</span>;
}

export function LeaderboardTable({ data, playerHrefPrefix = "/players", commissionerSlug }: LeaderboardTableProps) {
  const lastRankedIndex = data.reduce((last, row, i) => (row.rank !== null ? i : last), -1);

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="bg-primary hover:bg-primary">
            <TableHead className="w-12 text-center text-xs font-semibold uppercase tracking-wide text-primary-foreground">#</TableHead>
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
          {data.map((row, index) => (
            <React.Fragment key={row.playerId}>
              <TableRow
                className={`even:bg-muted/20 hover:bg-muted/40 transition-colors${row.rank === null ? " opacity-80" : ""}`}
              >
                <TableCell className="text-center">
                  <RankBadge rank={row.rank} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`${playerHrefPrefix}/${row.slug}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {row.name}
                    </Link>
                    {row.isSocial && (
                      <span className="rounded border border-gray-300 bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600">
                        Social
                      </span>
                    )}
                    {commissionerSlug && row.slug === commissionerSlug && (
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-yellow-400 bg-transparent text-[10px] font-bold text-yellow-500">C</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">{row.gp}</TableCell>
                <TableCell className="text-center font-semibold">
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
                <TableCell className="text-center">
                  {row.gp > 0 ? (
                    <span>
                      <span className="font-medium text-green-600">{row.wins}</span>
                      <span className="text-muted-foreground">&nbsp;·&nbsp;</span>
                      <span className="text-red-500">{row.losses}</span>
                      <span className="text-muted-foreground">&nbsp;·&nbsp;</span>
                      <span className="text-muted-foreground">{row.ties}</span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground">0&nbsp;·&nbsp;0&nbsp;·&nbsp;0</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {row.gp > 0 ? <WinPctBar pct={row.winPct} /> : "—"}
                </TableCell>
              </TableRow>
              {index === lastRankedIndex && (
                <TableRow key="unranked-divider" className="hover:bg-transparent">
                  <TableCell colSpan={9} className="py-1.5 text-center">
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-xs text-muted-foreground tracking-widest uppercase">Unranked — 10 rounds required</span>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
