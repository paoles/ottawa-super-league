"use client";

import { type Tee } from "@/lib/constants";

interface StepTeeProps {
  value: Tee | null;
  onChange: (tee: Tee) => void;
}

export function StepTee({ value, onChange }: StepTeeProps) {
  return (
    <div>
      <h3 className="mb-4 text-lg font-medium">Which tee box?</h3>
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onChange("White")}
          className={`rounded-xl border-2 p-8 text-center transition-all ${
            value === "White"
              ? "border-gray-500 bg-gray-50 ring-2 ring-gray-500"
              : "border-gray-200 bg-white hover:border-gray-400 hover:shadow-md"
          }`}
        >
          <div className="mx-auto mb-2 h-6 w-6 rounded-full border-2 border-gray-300 bg-white" />
          <p className="text-lg font-medium">White</p>
        </button>

        <button
          type="button"
          onClick={() => onChange("Blue")}
          className={`rounded-xl border-2 p-8 text-center transition-all ${
            value === "Blue"
              ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500"
              : "border-blue-200 bg-blue-50/50 hover:border-blue-400 hover:shadow-md"
          }`}
        >
          <div className="mx-auto mb-2 h-6 w-6 rounded-full bg-blue-500" />
          <p className="text-lg font-medium text-blue-900">Blue</p>
        </button>
      </div>
    </div>
  );
}
