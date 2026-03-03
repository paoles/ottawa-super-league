"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { calculateHandicapDiff } from "@/lib/handicap";
import type { FormData } from "./score-form";

interface StepReviewProps {
  formData: FormData;
}

export function StepReview({ formData }: StepReviewProps) {
  const { roundDate, course, tee, selectedPlayers, scores } = formData;

  // Calculate W/L/T preview
  const playerScores = selectedPlayers
    .map((p) => ({
      ...p,
      score: scores.get(p.id) ?? 0,
      hdcp: scores.get(p.id)
        ? calculateHandicapDiff(scores.get(p.id)!, course!, tee!)
        : 0,
    }))
    .sort((a, b) => a.score - b.score);

  const minScore = Math.min(...playerScores.map((p) => p.score));
  const winnersCount = playerScores.filter((p) => p.score === minScore).length;

  function getResult(score: number): string {
    if (selectedPlayers.length === 1) return "W";
    if (score === minScore) return winnersCount > 1 ? "T" : "W";
    return "L";
  }

  return (
    <div>
      <h3 className="mb-4 text-lg font-medium">Review & Submit</h3>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Date</span>
          <span className="font-medium">{roundDate}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Course</span>
          <span className="font-medium">{course}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tee Box</span>
          <span className="font-medium">{tee}</span>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="space-y-3">
        {playerScores.map((player) => {
          const result = getResult(player.score);
          return (
            <div
              key={player.id}
              className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
            >
              <div>
                <p className="font-medium">{player.name}</p>
                <p className="text-sm text-muted-foreground">
                  Hdcp: {player.hdcp.toFixed(1)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-light">{player.score}</span>
                <Badge
                  variant={
                    result === "W"
                      ? "default"
                      : result === "T"
                        ? "secondary"
                        : "outline"
                  }
                  className={result === "W" ? "bg-primary" : ""}
                >
                  {result}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
