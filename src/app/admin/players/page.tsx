import Link from "next/link";
import { db } from "@/lib/db";
import { players, scores } from "@/lib/db/schema";
import { count } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, X } from "lucide-react";
import { DeletePlayerButton } from "@/components/admin/delete-player-button";

export const dynamic = "force-dynamic";

export default async function AdminPlayersPage() {
  const allPlayers = await db.select().from(players).orderBy(players.name);

  const scoreCounts = await db
    .select({ playerId: scores.playerId, value: count() })
    .from(scores)
    .groupBy(scores.playerId);

  const scoreMap = new Map(scoreCounts.map((s) => [s.playerId, s.value]));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Players</h1>
        <Button asChild size="sm">
          <Link href="/admin/players/new">
            <Plus className="mr-1 h-4 w-4" />
            Add Player
          </Link>
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Edit a player to toggle <strong>Active</strong> — controls whether they
        appear in the Input Score picker. Inactive players keep their historical
        scores.
      </p>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="w-10 px-2 text-center">GP</TableHead>
              <TableHead className="w-20">
                <div className="flex items-center justify-end gap-1">
                  <span className="w-9 text-center">Edit</span>
                  <span className="w-9 text-center">Delete</span>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allPlayers.map((player) => (
              <TableRow key={player.id} className={player.isActive ? "" : "opacity-60"}>
                <TableCell>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {player.name}
                    {player.isCommissioner && (
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border-2 border-yellow-400 text-[11px] font-bold text-yellow-500">
                        C
                      </span>
                    )}
                    {player.isSocial && (
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-[11px] font-semibold text-primary">
                        S
                      </span>
                    )}
                    {!player.isActive && (
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-muted-foreground/30 bg-muted text-[11px] font-semibold text-muted-foreground">
                        <X className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="px-2 text-center">
                  {scoreMap.get(player.id) ?? 0}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/players/${player.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <DeletePlayerButton
                      playerId={player.id}
                      playerName={player.name}
                      hasScores={(scoreMap.get(player.id) ?? 0) > 0}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
