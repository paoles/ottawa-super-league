"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

interface StepPlayersProps {
  players: PlayerOption[];
  selected: PlayerOption[];
  onChange: (players: PlayerOption[]) => void;
}

export function StepPlayers({ players, selected, onChange }: StepPlayersProps) {
  const [open, setOpen] = useState(false);

  const availablePlayers = players.filter(
    (p) => !selected.some((s) => s.id === p.id)
  );

  function addPlayer(player: PlayerOption) {
    if (selected.length >= 4) return;
    onChange([...selected, player]);
    setOpen(false);
  }

  function removePlayer(id: number) {
    onChange(selected.filter((p) => p.id !== id));
  }

  return (
    <div>
      <h3 className="mb-4 text-lg font-medium">Who played?</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        Add 1-4 players from your group
      </p>

      {/* Selected players */}
      <div className="mb-4 flex flex-wrap gap-2">
        {selected.map((player) => (
          <Badge
            key={player.id}
            variant="secondary"
            className="flex items-center gap-1 py-2 pl-3 pr-2 text-sm"
          >
            {player.name}
            <button
              type="button"
              onClick={() => removePlayer(player.id)}
              className="ml-1 rounded-full hover:bg-foreground/10"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
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
