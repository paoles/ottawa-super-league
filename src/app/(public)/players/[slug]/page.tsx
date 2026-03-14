import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlayerHistoryChart } from "@/components/players/player-history-chart";
import { getPlayerProfile, getPlayerHistory, getAllPlayerSlugs } from "@/lib/stats";
import type { Metadata } from "next";

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getAllPlayerSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getPlayerProfile(slug);
  return {
    title: profile?.name || "Player",
  };
}

export default async function PlayerProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [profile, history] = await Promise.all([
    getPlayerProfile(slug),
    getPlayerHistory(slug),
  ]);

  if (!profile) notFound();

  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
          {initials}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-light">{profile.name}</h1>
            {profile.isSocial && <Badge variant="secondary">Social</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">
            {profile.rank ? `Rank #${profile.rank}` : "Unranked"} &middot;{" "}
            {profile.gp} rounds played
          </p>
        </div>
      </div>

      {profile.gp === 0 ? (
        <p className="text-muted-foreground">No rounds recorded yet.</p>
      ) : (
        <>
          {/* Overall stats */}
          <div className="mb-6 grid grid-cols-3 gap-3 sm:grid-cols-6">
            {[
              { label: "Avg", value: profile.strokeAvg.toFixed(1) },
              { label: "Hdcp", value: profile.hdcpAvg.toFixed(1) },
              { label: "Best", value: profile.bestRound },
              { label: "Worst", value: profile.worstRound },
              { label: "Win%", value: `${profile.winPct.toFixed(0)}%` },
              {
                label: "W-L-T",
                value: `${profile.wins}-${profile.losses}-${profile.ties}`,
              },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-3 text-center">
                  <p className="text-lg font-light">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Score History Chart */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base font-light">
                Score History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PlayerHistoryChart rounds={history} />
            </CardContent>
          </Card>

          {/* Per-Course Breakdown */}
          {profile.courseStats.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base font-light">
                  Course Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course</TableHead>
                        <TableHead className="text-center">GP</TableHead>
                        <TableHead className="text-center">Avg</TableHead>
                        <TableHead className="text-center">Best</TableHead>
                        <TableHead className="text-center">Worst</TableHead>
                        <TableHead className="text-center">Hdcp</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profile.courseStats.map((cs) => (
                        <TableRow key={cs.course}>
                          <TableCell className="font-medium">
                            {cs.course}
                          </TableCell>
                          <TableCell className="text-center">{cs.gp}</TableCell>
                          <TableCell className="text-center">
                            {cs.strokeAvg.toFixed(1)}
                          </TableCell>
                          <TableCell className="text-center">
                            {cs.bestRound}
                          </TableCell>
                          <TableCell className="text-center">
                            {cs.worstRound}
                          </TableCell>
                          <TableCell className="text-center">
                            {cs.hdcpAvg.toFixed(1)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Round-by-Round History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-light">
                Round History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Tee</TableHead>
                      <TableHead className="text-center">Score</TableHead>
                      <TableHead className="text-center">Hdcp</TableHead>
                      <TableHead className="text-center">Result</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((round) => (
                      <TableRow key={round.id}>
                        <TableCell className="whitespace-nowrap">
                          {new Date(round.roundDate + "T00:00:00").toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric" }
                          )}
                        </TableCell>
                        <TableCell>{round.course}</TableCell>
                        <TableCell>{round.tee}</TableCell>
                        <TableCell className="text-center font-medium">
                          {round.score}
                        </TableCell>
                        <TableCell className="text-center">
                          {round.handicapDiff.toFixed(1)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              round.result === "W"
                                ? "default"
                                : round.result === "T"
                                  ? "secondary"
                                  : "outline"
                            }
                            className={
                              round.result === "W" ? "bg-primary" : ""
                            }
                          >
                            {round.result}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
