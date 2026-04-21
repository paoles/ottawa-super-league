"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface ActiveToggleProps {
  playerId: number;
  playerName: string;
  isSocial: boolean;
  photoUrl: string | null;
  initialActive: boolean;
}

export function ActiveToggle({
  playerId,
  playerName,
  isSocial,
  photoUrl,
  initialActive,
}: ActiveToggleProps) {
  const router = useRouter();
  const [active, setActive] = useState(initialActive);
  const [loading, setLoading] = useState(false);

  async function handleToggle(next: boolean) {
    setActive(next);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/players/${playerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: playerName,
          isSocial,
          isActive: next,
          photoUrl: photoUrl ?? "",
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to update");
        setActive(!next);
      } else {
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong");
      setActive(!next);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Switch
      checked={active}
      disabled={loading}
      onCheckedChange={handleToggle}
      aria-label={`Toggle active for ${playerName}`}
    />
  );
}
