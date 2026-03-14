"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerForm } from "@/components/admin/player-form";
import { toast } from "sonner";
import type { z } from "zod";
import type { playerCreateSchema } from "@/lib/validations";

type PlayerFormData = z.infer<typeof playerCreateSchema>;

export default function NewPlayerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(data: PlayerFormData) {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (res.ok) {
        toast.success("Player created");
        router.push("/admin/players");
      } else {
        toast.error(result.error || "Failed to create player");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Add Player</CardTitle>
        </CardHeader>
        <CardContent>
          <PlayerForm
            onSubmit={handleSubmit}
            isLoading={loading}
            submitLabel="Create Player"
          />
        </CardContent>
      </Card>
    </div>
  );
}
