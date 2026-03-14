"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Minus, Plus } from "lucide-react";
import type { Course, Tee } from "@/lib/constants";
import type { PlayerOption } from "@/types";

interface StepScoresProps {
  players: PlayerOption[];
  scores: Map<number, number>;
  tees: Map<number, Tee>;
  course: Course;
  onChange: (scores: Map<number, number>) => void;
}

export function StepScores({
  players,
  scores,
  tees,
  course,
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

  function adjustScore(playerId: number, delta: number) {
    const current = scores.get(playerId);
    if (current === undefined) return;
    const next = Math.min(90, Math.max(20, current + delta));
    const newScores = new Map(scores);
    newScores.set(playerId, next);
    onChange(newScores);
  }

  function buildSuggestions(avg: number): number[] {
    return [avg - 2, avg - 1, avg, avg + 1, avg + 2];
  }

  return (
    <div>
      <h3 className="mb-1 text-lg font-medium">Enter scores</h3>
      <p className="mb-5 text-sm text-muted-foreground">
        9-hole score for {course}
      </p>

      <div className="space-y-5">
        {players.map((player) => {
          const score = scores.get(player.id);
          const tee = tees.get(player.id) ?? "White";
          const avg = player.avgScore;
          const suggestions = avg !== null ? buildSuggestions(avg) : null;
          const hasScore = score !== undefined;

          return (
            <div key={player.id} className="space-y-2">
              <div className="flex items-baseline justify-between">
                <Label htmlFor={`score-${player.id}`} className="text-sm font-medium">
                  {player.name}
                </Label>
                <span className="text-xs text-muted-foreground">
                  {tee} tees
                </span>
              </div>

              {/* Score suggestions — only before a score is entered */}
              {suggestions && !hasScore && (
                <div className="flex gap-1.5">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => updateScore(player.id, String(s))}
                      className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors hover:border-primary hover:bg-primary/5 ${
                        s === avg
                          ? "border-primary/40 bg-primary/5 text-primary"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Score input with +/- buttons */}
              <div className="flex items-center gap-2">
                {hasScore && (
                  <button
                    type="button"
                    onClick={() => adjustScore(player.id, -1)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                )}
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
                {hasScore && (
                  <button
                    type="button"
                    onClick={() => adjustScore(player.id, 1)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
