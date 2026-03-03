"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateHandicapDiff } from "@/lib/handicap";
import type { Course, Tee } from "@/lib/constants";
import type { PlayerOption } from "@/types";

interface StepScoresProps {
  players: PlayerOption[];
  scores: Map<number, number>;
  course: Course;
  tee: Tee;
  onChange: (scores: Map<number, number>) => void;
}

export function StepScores({
  players,
  scores,
  course,
  tee,
  onChange,
}: StepScoresProps) {
  function updateScore(playerId: number, value: string) {
    const num = parseInt(value, 10);
    const newScores = new Map(scores);
    if (isNaN(num)) {
      newScores.delete(playerId);
    } else {
      newScores.set(playerId, num);
    }
    onChange(newScores);
  }

  return (
    <div>
      <h3 className="mb-4 text-lg font-medium">Enter scores</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        9-hole score for {course} ({tee} tees)
      </p>

      <div className="space-y-4">
        {players.map((player) => {
          const score = scores.get(player.id);
          const hdcp =
            score && score > 0
              ? calculateHandicapDiff(score, course, tee)
              : null;

          return (
            <div key={player.id} className="space-y-1">
              <Label htmlFor={`score-${player.id}`}>{player.name}</Label>
              <div className="flex items-center gap-3">
                <Input
                  id={`score-${player.id}`}
                  type="number"
                  inputMode="numeric"
                  min={20}
                  max={90}
                  placeholder="Score"
                  value={score ?? ""}
                  onChange={(e) => updateScore(player.id, e.target.value)}
                  className="text-center text-lg"
                />
                {hdcp !== null && (
                  <span className="whitespace-nowrap text-sm text-muted-foreground">
                    Hdcp: {hdcp.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
