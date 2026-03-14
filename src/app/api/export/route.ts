import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getLeaderboardData, getScoresForExport } from "@/lib/stats";
import { generateLeaderboardCsv, generateScoresCsv } from "@/lib/csv";

export async function GET(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  if (type === "leaderboard") {
    const data = await getLeaderboardData();
    const csv = generateLeaderboardCsv(data);

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition":
          'attachment; filename="osl-leaderboard.csv"',
      },
    });
  }

  if (type === "scores") {
    const data = await getScoresForExport();
    const csv = generateScoresCsv(data);

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="osl-scores.csv"',
      },
    });
  }

  return NextResponse.json(
    { error: 'Invalid type. Use ?type=scores or ?type=leaderboard' },
    { status: 400 }
  );
}
