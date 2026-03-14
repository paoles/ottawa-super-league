import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { scores, players } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { scoreUpdateSchema } from "@/lib/validations";
import { calculateHandicapDiff } from "@/lib/handicap";
import type { Course, Tee } from "@/lib/constants";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const scoreId = parseInt(id, 10);
    if (isNaN(scoreId)) {
      return NextResponse.json({ error: "Invalid score ID" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = scoreUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { roundDate, course, tee, score } = parsed.data;
    const handicapDiff = calculateHandicapDiff(
      score,
      course as Course,
      tee as Tee
    );

    const [updated] = await db
      .update(scores)
      .set({ roundDate, course, tee, score, handicapDiff })
      .where(eq(scores.id, scoreId))
      .returning({ playerId: scores.playerId });

    if (!updated) {
      return NextResponse.json({ error: "Score not found" }, { status: 404 });
    }

    // Revalidate affected pages
    revalidatePath("/");
    revalidatePath("/statistics");
    revalidatePath("/players");

    const [player] = await db
      .select({ slug: players.slug })
      .from(players)
      .where(eq(players.id, updated.playerId));

    if (player) {
      revalidatePath(`/players/${player.slug}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update score error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const scoreId = parseInt(id, 10);
    if (isNaN(scoreId)) {
      return NextResponse.json({ error: "Invalid score ID" }, { status: 400 });
    }

    const [deleted] = await db
      .delete(scores)
      .where(eq(scores.id, scoreId))
      .returning({ playerId: scores.playerId });

    if (!deleted) {
      return NextResponse.json({ error: "Score not found" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/statistics");
    revalidatePath("/players");

    const [player] = await db
      .select({ slug: players.slug })
      .from(players)
      .where(eq(players.id, deleted.playerId));

    if (player) {
      revalidatePath(`/players/${player.slug}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete score error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
