import Link from "next/link";
import { db } from "@/lib/db";
import { players, scores } from "@/lib/db/schema";
import { count } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BarChart3 } from "lucide-react";

export default async function AdminDashboardPage() {
  const [playerCount] = await db.select({ value: count() }).from(players);
  const [scoreCount] = await db.select({ value: count() }).from(scores);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/admin/players">
          <Card className="transition-colors hover:border-primary/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Players
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{playerCount.value}</div>
              <p className="text-xs text-muted-foreground">Manage player profiles</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/scores">
          <Card className="transition-colors hover:border-primary/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Scores
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{scoreCount.value}</div>
              <p className="text-xs text-muted-foreground">Manage score records</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
