import { db } from "@/lib/db";
import { scores, players } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScoreActions } from "@/components/admin/score-actions";

export const dynamic = "force-dynamic";

export default async function AdminScoresPage() {
  const allScores = await db
    .select({
      id: scores.id,
      roundDate: scores.roundDate,
      course: scores.course,
      tee: scores.tee,
      score: scores.score,
      handicapDiff: scores.handicapDiff,
      playerId: scores.playerId,
      playerName: players.name,
    })
    .from(scores)
    .innerJoin(players, eq(scores.playerId, players.id))
    .orderBy(desc(scores.roundDate), players.name);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Scores</h1>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Player</TableHead>
              <TableHead>Course</TableHead>
              <TableHead className="text-center">Tee</TableHead>
              <TableHead className="text-center">Score</TableHead>
              <TableHead className="text-center">Hdcp</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allScores.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="whitespace-nowrap">{s.roundDate}</TableCell>
                <TableCell>{s.playerName}</TableCell>
                <TableCell>{s.course}</TableCell>
                <TableCell className="text-center">{s.tee}</TableCell>
                <TableCell className="text-center font-medium">{s.score}</TableCell>
                <TableCell className="text-center">
                  {s.handicapDiff.toFixed(1)}
                </TableCell>
                <TableCell className="text-right">
                  <ScoreActions
                    scoreId={s.id}
                    defaultValues={{
                      roundDate: s.roundDate,
                      course: s.course,
                      tee: s.tee,
                      score: s.score,
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
