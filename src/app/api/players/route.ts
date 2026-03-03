import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { players } from "@/lib/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  const allPlayers = await db
    .select({ id: players.id, name: players.name })
    .from(players)
    .orderBy(asc(players.name));

  return NextResponse.json(allPlayers);
}
