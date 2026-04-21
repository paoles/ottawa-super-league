import { z } from "zod";

export const scoreSubmissionSchema = z.object({
  roundDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  course: z.enum(["East", "North", "West", "South"]),
  players: z
    .array(
      z.object({
        playerId: z.number().int().positive(),
        score: z.number().int().min(20).max(90),
        tee: z.enum(["White", "Blue"]),
      })
    )
    .min(1, "At least one player is required")
    .max(4, "Maximum 4 players per group"),
});

export type ScoreSubmission = z.infer<typeof scoreSubmissionSchema>;

export const playerCreateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  isSocial: z.boolean(),
  isActive: z.boolean(),
  photoUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
});

export const playerUpdateSchema = playerCreateSchema;

export const publicPlayerCreateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
});

export const scoreUpdateSchema = z.object({
  roundDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  course: z.enum(["East", "North", "West", "South"]),
  tee: z.enum(["White", "Blue"]),
  score: z.number().int().min(20).max(90),
});
