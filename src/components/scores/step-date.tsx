"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StepDateProps {
  value: string;
  onChange: (date: string) => void;
}

export function StepDate({ value, onChange }: StepDateProps) {
  return (
    <div>
      <h3 className="mb-4 text-lg font-medium">When did you play?</h3>
      <div className="space-y-2">
        <Label htmlFor="round-date">Round Date</Label>
        <Input
          id="round-date"
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          max={new Date().toISOString().slice(0, 10)}
          className="text-base"
        />
      </div>
    </div>
  );
}
