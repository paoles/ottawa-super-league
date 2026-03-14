"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlayerForm } from "@/components/admin/player-form";
import { toast } from "sonner";
import type { z } from "zod";
import type { playerCreateSchema } from "@/lib/validations";

type PlayerFormData = z.infer<typeof playerCreateSchema>;

interface EditPlayerFormProps {
  playerId: number;
  defaultValues: Partial<PlayerFormData>;
}

export function EditPlayerForm({ playerId, defaultValues }: EditPlayerFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(data: PlayerFormData) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/players/${playerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (res.ok) {
        toast.success("Player updated");
        router.push("/admin/players");
      } else {
        toast.error(result.error || "Failed to update player");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PlayerForm
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      isLoading={loading}
      submitLabel="Update Player"
    />
  );
}
