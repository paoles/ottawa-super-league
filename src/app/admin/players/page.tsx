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
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil } from "lucide-react";
import { DeletePlayerButton } from "@/components/admin/delete-player-button";
import { ActiveToggle } from "@/components/admin/active-toggle";

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
        Toggle <strong>Active</strong> to control whether a player appears in
        the Input Score picker. Inactive players keep their historical scores.
      </p>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="w-20 text-center">GP</TableHead>
              <TableHead className="w-24 text-center">Active</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allPlayers.map((player) => (
              <TableRow key={player.id} className={player.isActive ? "" : "opacity-60"}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {player.name}
                    {player.isSocial && (
                      <Badge variant="secondary" className="text-xs">
                        Social
                      </Badge>
                    )}
                    {!player.isActive && (
                      <Badge variant="outline" className="text-xs">
                        Inactive
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {scoreMap.get(player.id) ?? 0}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <ActiveToggle
                      playerId={player.id}
                      playerName={player.name}
                      isSocial={player.isSocial}
                      photoUrl={player.photoUrl}
                      initialActive={player.isActive}
                    />
                  </div>
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
