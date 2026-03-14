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
import { X, UserPlus } from "lucide-react";
import type { PlayerOption } from "@/types";
import type { Tee } from "@/lib/constants";

interface StepPlayersProps {
  players: PlayerOption[];
  selected: PlayerOption[];
  tees: Map<number, Tee>;
  onPlayerAdd: (player: PlayerOption) => void;
  onPlayerRemove: (playerId: number) => void;
  onTeeChange: (playerId: number, tee: Tee) => void;
}

export function StepPlayers({
  players,
  selected,
  tees,
  onPlayerAdd,
  onPlayerRemove,
  onTeeChange,
}: StepPlayersProps) {
  const [open, setOpen] = useState(false);

  const availablePlayers = players.filter(
    (p) => !selected.some((s) => s.id === p.id)
  );

  function addPlayer(player: PlayerOption) {
    if (selected.length >= 4) return;
    onPlayerAdd(player);
    setOpen(false);
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
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Player ({selected.length}/4)
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
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
      )}
    </div>
  );
}
