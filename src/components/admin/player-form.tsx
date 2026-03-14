"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { playerCreateSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { z } from "zod";

type PlayerFormData = z.infer<typeof playerCreateSchema>;

interface PlayerFormProps {
  defaultValues?: Partial<PlayerFormData>;
  onSubmit: (data: PlayerFormData) => Promise<void>;
  isLoading: boolean;
  submitLabel?: string;
}

export function PlayerForm({
  defaultValues,
  onSubmit,
  isLoading,
  submitLabel = "Save",
}: PlayerFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PlayerFormData>({
    resolver: zodResolver(playerCreateSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      isSocial: defaultValues?.isSocial ?? false,
      photoUrl: defaultValues?.photoUrl ?? "",
    },
  });

  const isSocial = watch("isSocial");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register("name")} placeholder="Player name" />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="photoUrl">Photo URL</Label>
        <Input
          id="photoUrl"
          {...register("photoUrl")}
          placeholder="https://example.com/photo.jpg"
        />
        {errors.photoUrl && (
          <p className="text-sm text-destructive">{errors.photoUrl.message}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Switch
          id="isSocial"
          checked={isSocial}
          onCheckedChange={(checked) => setValue("isSocial", checked)}
        />
        <Label htmlFor="isSocial">Social Player</Label>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
