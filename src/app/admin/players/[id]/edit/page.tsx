import { db } from "@/lib/db";
import { players } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditPlayerForm } from "@/components/admin/edit-player-form";

export const dynamic = "force-dynamic";

export default async function EditPlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const playerId = parseInt(id, 10);
  if (isNaN(playerId)) notFound();

  const [player] = await db
    .select()
    .from(players)
    .where(eq(players.id, playerId));

  if (!player) notFound();

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Edit {player.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <EditPlayerForm
            playerId={player.id}
            defaultValues={{
              name: player.name,
              isSocial: player.isSocial,
              isActive: player.isActive,
              isCommissioner: player.isCommissioner,
              photoUrl: player.photoUrl ?? "",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
