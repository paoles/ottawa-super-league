import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { LeaderboardRow } from "@/types";

interface LeaderboardTableProps {
  data: LeaderboardRow[];
}

export function LeaderboardTable({ data }: LeaderboardTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-12 text-center">Rank</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="text-center">GP</TableHead>
            <TableHead className="text-center">Avg</TableHead>
            <TableHead className="text-center">Hdcp</TableHead>
            <TableHead className="text-center">Best</TableHead>
            <TableHead className="text-center">Worst</TableHead>
            <TableHead className="text-center">Med</TableHead>
            <TableHead className="text-center">W</TableHead>
            <TableHead className="text-center">L</TableHead>
            <TableHead className="text-center">T</TableHead>
            <TableHead className="text-center">Win%</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.playerId} className="hover:bg-muted/30">
              <TableCell className="text-center font-medium">
                {row.rank ?? "—"}
              </TableCell>
              <TableCell>
                <Link
                  href={`/players/${row.slug}`}
                  className="font-medium text-primary hover:underline"
                >
                  {row.name}
                </Link>
                {row.isSocial && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Social
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-center">{row.gp}</TableCell>
              <TableCell className="text-center">
                {row.gp > 0 ? row.strokeAvg.toFixed(2) : "—"}
              </TableCell>
              <TableCell className="text-center">
                {row.gp > 0 ? row.hdcpAvg.toFixed(2) : "—"}
              </TableCell>
              <TableCell className="text-center">
                {row.gp > 0 ? row.bestRound : "—"}
              </TableCell>
              <TableCell className="text-center">
                {row.gp > 0 ? row.worstRound : "—"}
              </TableCell>
              <TableCell className="text-center">
                {row.gp > 0 ? row.median : "—"}
              </TableCell>
              <TableCell className="text-center">{row.wins}</TableCell>
              <TableCell className="text-center">{row.losses}</TableCell>
              <TableCell className="text-center">{row.ties}</TableCell>
              <TableCell className="text-center">
                {row.gp > 0 ? `${row.winPct.toFixed(1)}%` : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
