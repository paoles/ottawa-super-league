import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { players, scores } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { playerUpdateSchema } from "@/lib/validations";

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const playerId = parseInt(id, 10);
    if (isNaN(playerId)) {
      return NextResponse.json({ error: "Invalid player ID" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = playerUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Get existing player for old slug
    const [existing] = await db
      .select({ slug: players.slug })
      .from(players)
      .where(eq(players.id, playerId));

    if (!existing) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    const { name, isSocial, isActive, isCommissioner, photoUrl } = parsed.data;
    const newSlug = toSlug(name);

    await db
      .update(players)
      .set({
        name,
        slug: newSlug,
        isSocial,
        isActive,
        isCommissioner,
        photoUrl: photoUrl || null,
      })
      .where(eq(players.id, playerId));

    revalidatePath("/players");
    revalidatePath(`/players/${existing.slug}`);
    if (newSlug !== existing.slug) {
      revalidatePath(`/players/${newSlug}`);
    }
    revalidatePath("/");
    revalidatePath("/scores");

    return NextResponse.json({ success: true, slug: newSlug });
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("UNIQUE")) {
      return NextResponse.json(
        { error: "A player with this name already exists" },
        { status: 409 }
      );
    }
    console.error("Update player error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const playerId = parseInt(id, 10);
    if (isNaN(playerId)) {
      return NextResponse.json({ error: "Invalid player ID" }, { status: 400 });
    }

    // Check for existing scores
    const [scoreCount] = await db
      .select({ value: count() })
      .from(scores)
      .where(eq(scores.playerId, playerId));

    if (scoreCount.value > 0) {
      return NextResponse.json(
        { error: `Player has ${scoreCount.value} score(s). Delete their scores first.` },
        { status: 409 }
      );
    }

    const [deleted] = await db
      .delete(players)
      .where(eq(players.id, playerId))
      .returning({ slug: players.slug });

    if (!deleted) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    revalidatePath("/players");
    revalidatePath(`/players/${deleted.slug}`);
    revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete player error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
