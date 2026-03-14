import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { scores, players } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { scoreSubmissionSchema } from "@/lib/validations";
import { calculateHandicapDiff } from "@/lib/handicap";
import type { Course, Tee } from "@/lib/constants";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = scoreSubmissionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { roundDate, course, players: playerEntries } = parsed.data;

    // Validate all player IDs exist before inserting anything
    const playerIds = playerEntries.map((e) => e.playerId);
    const existingPlayers = await db
      .select({ id: players.id, slug: players.slug })
      .from(players)
      .where(inArray(players.id, playerIds));

    const existingIds = new Set(existingPlayers.map((p) => p.id));
    for (const entry of playerEntries) {
      if (!existingIds.has(entry.playerId)) {
        return NextResponse.json(
          { error: `Player ID ${entry.playerId} not found` },
          { status: 404 }
        );
      }
    }

    const inserted: number[] = [];

    for (const entry of playerEntries) {
      const hdcp = calculateHandicapDiff(
        entry.score,
        course as Course,
        entry.tee as Tee
      );

      const result = await db
        .insert(scores)
        .values({
          playerId: entry.playerId,
          roundDate,
          course,
          tee: entry.tee,
          score: entry.score,
          handicapDiff: hdcp,
        })
        .returning({ id: scores.id });

      inserted.push(result[0].id);
    }

    // Revalidate affected pages
    revalidatePath("/");
    revalidatePath("/statistics");
    revalidatePath("/players");

    for (const p of existingPlayers) {
      revalidatePath(`/players/${p.slug}`);
    }

    return NextResponse.json({ success: true, inserted: inserted.length });
  } catch (error) {
    console.error("Score submission error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
