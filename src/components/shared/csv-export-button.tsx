"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface CsvExportButtonProps {
  type: "scores" | "leaderboard";
  label?: string;
}

export function CsvExportButton({
  type,
  label = "Export CSV",
}: CsvExportButtonProps) {
  async function handleExport() {
    const res = await fetch(`/api/export?type=${type}`);
    if (!res.ok) return;

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `osl-${type}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport}>
      <Download className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
}
