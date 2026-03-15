"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { type Course, type Tee } from "@/lib/constants";
import { Check, ChevronLeft, Loader2 } from "lucide-react";
import { StepDate } from "./step-date";
import { StepCourse } from "./step-course";
import { StepPlayers } from "./step-players";
import { StepScores } from "./step-scores";
import { StepReview } from "./step-review";
import type { PlayerOption } from "@/types";

interface ScoreFormProps {
  players: PlayerOption[];
}

export interface FormData {
  roundDate: string;
  course: Course | null;
  tees: Map<number, Tee>;
  selectedPlayers: PlayerOption[];
  scores: Map<number, number>;
}

const TOTAL_STEPS = 5;
const STEP_LABELS = ["Date", "Course", "Players", "Scores", "Review"];

export function ScoreForm({ players }: ScoreFormProps) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    roundDate: new Date().toISOString().slice(0, 10),
    course: null,
    tees: new Map(),
    selectedPlayers: [],
    scores: new Map(),
  });

  function canAdvance(): boolean {
    switch (step) {
      case 1:
        return !!formData.roundDate;
      case 2:
        return !!formData.course;
      case 3:
        return (
          formData.selectedPlayers.length >= 1 &&
          formData.selectedPlayers.every((p) => formData.tees.has(p.id))
        );
      case 4:
        return formData.selectedPlayers.every(
          (p) => formData.scores.has(p.id) && formData.scores.get(p.id)! > 0
        );
      default:
        return true;
    }
  }

  async function handleSubmit() {
    if (!formData.course) return;

    setSubmitting(true);
    try {
      const payload = {
        roundDate: formData.roundDate,
        course: formData.course,
        players: formData.selectedPlayers.map((p) => ({
          playerId: p.id,
          score: formData.scores.get(p.id)!,
          tee: formData.tees.get(p.id)!,
        })),
      };

      const res = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Submission failed");
      }

      setSubmitted(true);
      toast.success("Scores submitted successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setFormData({
      roundDate: new Date().toISOString().slice(0, 10),
      course: null,
      tees: new Map(),
      selectedPlayers: [],
      scores: new Map(),
    });
    setStep(1);
    setSubmitted(false);
  }

  if (submitted) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Check className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-medium">Scores Submitted!</h2>
          <p className="text-sm text-muted-foreground">
            The leaderboard will update shortly.
          </p>
          <Button onClick={handleReset} className="mt-2">
            Submit More Scores
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      {/* Progress */}
      <div className="mb-6 flex items-center">
        {STEP_LABELS.map((label, i) => (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium ${
                  i + 1 < step
                    ? "bg-primary text-primary-foreground"
                    : i + 1 === step
                      ? "bg-primary/20 text-primary ring-2 ring-primary"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {i + 1 < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className="hidden text-xs text-muted-foreground sm:block">
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`mx-1 mb-3 h-0.5 flex-1 ${i + 1 < step ? "bg-primary" : "bg-muted"}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step content */}
      <Card>
        <CardContent className="p-6">
          {step === 1 && (
            <StepDate
              value={formData.roundDate}
              onChange={(date) =>
                setFormData((d) => ({ ...d, roundDate: date }))
              }
            />
          )}
          {step === 2 && (
            <StepCourse
              value={formData.course}
              onChange={(course) =>
                setFormData((d) => ({ ...d, course }))
              }
            />
          )}
          {step === 3 && (
            <StepPlayers
              players={players}
              selected={formData.selectedPlayers}
              tees={formData.tees}
              onPlayerAdd={(player) =>
                setFormData((d) => {
                  const tees = new Map(d.tees);
                  tees.set(player.id, "White");
                  return {
                    ...d,
                    tees,
                    selectedPlayers: [...d.selectedPlayers, player],
                  };
                })
              }
              onPlayerRemove={(playerId) =>
                setFormData((d) => {
                  const tees = new Map(d.tees);
                  tees.delete(playerId);
                  const scores = new Map(d.scores);
                  scores.delete(playerId);
                  return {
                    ...d,
                    tees,
                    scores,
                    selectedPlayers: d.selectedPlayers.filter(
                      (p) => p.id !== playerId
                    ),
                  };
                })
              }
              onTeeChange={(playerId, tee) =>
                setFormData((d) => {
                  const tees = new Map(d.tees);
                  tees.set(playerId, tee);
                  return { ...d, tees };
                })
              }
            />
          )}
          {step === 4 && (
            <StepScores
              players={formData.selectedPlayers}
              scores={formData.scores}
              tees={formData.tees}
              course={formData.course!}
              onChange={(scores) => setFormData((d) => ({ ...d, scores }))}
            />
          )}
          {step === 5 && <StepReview formData={formData} />}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="mt-4 flex justify-between">
        <Button
          variant="outline"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 1}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back
        </Button>

        {step < TOTAL_STEPS ? (
          <Button onClick={() => setStep((s) => s + 1)} disabled={!canAdvance()}>
            Next
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Scores
          </Button>
        )}
      </div>
    </div>
  );
}
