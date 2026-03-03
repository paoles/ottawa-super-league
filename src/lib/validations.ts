import { z } from "zod";

export const scoreSubmissionSchema = z.object({
  roundDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  course: z.enum(["East", "North", "West", "South"]),
  tee: z.enum(["White", "Blue"]),
  players: z
    .array(
      z.object({
        playerId: z.number().int().positive(),
        score: z.number().int().min(20).max(90),
      })
    )
    .min(1, "At least one player is required")
    .max(4, "Maximum 4 players per group"),
});

export type ScoreSubmission = z.infer<typeof scoreSubmissionSchema>;
