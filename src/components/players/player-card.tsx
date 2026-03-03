import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PlayerCardProps {
  name: string;
  slug: string;
  isSocial: boolean;
  gp: number;
  strokeAvg: number;
  hdcpAvg: number;
}

export function PlayerCard({
  name,
  slug,
  isSocial,
  gp,
  strokeAvg,
  hdcpAvg,
}: PlayerCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Link href={`/players/${slug}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate font-medium">{name}</p>
              {isSocial && (
                <Badge variant="secondary" className="shrink-0 text-xs">
                  Social
                </Badge>
              )}
            </div>
            <div className="mt-1 flex gap-4 text-sm text-muted-foreground">
              <span>{gp} GP</span>
              {gp > 0 && (
                <>
                  <span>Avg: {strokeAvg.toFixed(1)}</span>
                  <span>Hdcp: {hdcpAvg.toFixed(1)}</span>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
