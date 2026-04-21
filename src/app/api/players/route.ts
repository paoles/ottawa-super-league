import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { players } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { publicPlayerCreateSchema } from "@/lib/validations";

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET() {
  const allPlayers = await db
    .select({ id: players.id, name: players.name })
    .from(players)
    .orderBy(asc(players.name));

  return NextResponse.json(allPlayers);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = publicPlayerCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const name = parsed.data.name.trim().replace(/\s+/g, " ");
    const slug = toSlug(name);

    const result = await db
      .insert(players)
      .values({ name, slug, isSocial: true, isActive: true, photoUrl: null })
      .returning({ id: players.id, name: players.name });

    revalidatePath("/scores");
    revalidatePath("/admin/players");

    return NextResponse.json({ id: result[0].id, name: result[0].name });
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("UNIQUE")) {
      return NextResponse.json(
        { error: "A player with this name already exists" },
        { status: 409 }
      );
    }
    console.error(
      "Create player error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
