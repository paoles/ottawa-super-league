"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, UserPlus, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import type { PlayerOption } from "@/types";
import type { Tee } from "@/lib/constants";

interface StepPlayersProps {
  players: PlayerOption[];
  selected: PlayerOption[];
  tees: Map<number, Tee>;
  onPlayerAdd: (player: PlayerOption) => void;
  onPlayerRemove: (playerId: number) => void;
  onTeeChange: (playerId: number, tee: Tee) => void;
  onPlayerCreated: (player: PlayerOption) => void;
}

export function StepPlayers({
  players,
  selected,
  tees,
  onPlayerAdd,
  onPlayerRemove,
  onTeeChange,
  onPlayerCreated,
}: StepPlayersProps) {
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  const availablePlayers = players.filter(
    (p) => !selected.some((s) => s.id === p.id)
  );

  function addPlayer(player: PlayerOption) {
    if (selected.length >= 4) return;
    onPlayerAdd(player);
    setOpen(false);
  }

  function openCreateDialog() {
    setOpen(false);
    setNewName("");
    setDialogOpen(true);
  }

  async function handleCreate() {
    const trimmed = newName.trim().replace(/\s+/g, " ");
    if (trimmed.length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to add player");
        return;
      }
      const created: PlayerOption = {
        id: data.id,
        name: data.name,
        avgScore: null,
      };
      onPlayerCreated(created);
      onPlayerAdd(created);
      toast.success(`${created.name} added as a Social player`);
      setDialogOpen(false);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <h3 className="mb-1 text-lg font-medium">Who played?</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        Add 1–4 players and set each tee box
      </p>

      {/* Selected players */}
      <div className="mb-4 space-y-2">
        {selected.map((player) => {
          const tee = tees.get(player.id) ?? "White";
          return (
            <div
              key={player.id}
              className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2"
            >
              <span className="font-medium text-sm">{player.name}</span>
              <div className="flex items-center gap-2">
                {/* Tee toggle */}
                <div className="flex rounded-md border overflow-hidden text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => onTeeChange(player.id, "White")}
                    className={`px-3 py-1.5 transition-colors ${
                      tee === "White"
                        ? "bg-gray-700 text-white"
                        : "bg-white text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    White
                  </button>
                  <button
                    type="button"
                    onClick={() => onTeeChange(player.id, "Blue")}
                    className={`px-3 py-1.5 transition-colors ${
                      tee === "Blue"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    Blue
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => onPlayerRemove(player.id)}
                  className="rounded-full p-1 text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add player combobox */}
      {selected.length < 4 && (
        <>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Player ({selected.length}/4)
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="p-0"
              style={{ width: "var(--radix-popover-trigger-width)" }}
              align="start"
            >
              <Command>
                <CommandInput placeholder="Search players..." />
                <CommandList>
                  <CommandEmpty>No players found.</CommandEmpty>
                  <CommandGroup>
                    {availablePlayers.map((player) => (
                      <CommandItem
                        key={player.id}
                        value={player.name}
                        onSelect={() => addPlayer(player)}
                      >
                        {player.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <button
            type="button"
            onClick={openCreateDialog}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-primary/40 bg-primary/5 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
          >
            <Plus className="h-4 w-4" />
            Can&apos;t find your name? Add a new player
          </button>
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a new player</DialogTitle>
            <DialogDescription>
              New players are added as <strong>Social</strong> by default. The
              commissioner can change this in the admin page.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="new-player-name">Player name</Label>
            <Input
              id="new-player-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="First Last"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && !creating) {
                  e.preventDefault();
                  handleCreate();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating || newName.trim().length < 2}>
              {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Player
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
