import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { players } from "@/lib/db/schema";
import { playerCreateSchema } from "@/lib/validations";

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = playerCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, isSocial, isActive, photoUrl } = parsed.data;
    const slug = toSlug(name);

    const result = await db
      .insert(players)
      .values({
        name,
        slug,
        isSocial,
        isActive,
        photoUrl: photoUrl || null,
      })
      .returning({ id: players.id });

    revalidatePath("/players");
    revalidatePath("/");
    revalidatePath("/scores");

    return NextResponse.json({ success: true, id: result[0].id, slug });
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("UNIQUE")) {
      return NextResponse.json(
        { error: "A player with this name already exists" },
        { status: 409 }
      );
    }
    console.error("Create player error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
