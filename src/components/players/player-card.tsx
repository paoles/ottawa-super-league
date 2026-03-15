import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

interface PlayerCardPlayer {
  id: number;
  name: string;
  slug: string;
  isSocial: boolean;
  photoUrl: string | null;
  gp: number;
  strokeAvg: number;
  hdcpAvg: number;
  rank: number | null;
}

interface PlayerCardProps {
  player: PlayerCardPlayer;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function PlayerCard({ player }: PlayerCardProps) {
  const { name, slug, isSocial, photoUrl, gp, strokeAvg, hdcpAvg, rank } = player;

  return (
    <Link href={`/players/${slug}`}>
      <Card className="relative py-0 shadow-md transition-shadow hover:shadow-lg h-full">
        {isSocial && (
          <span className="absolute top-2 right-2 z-10 rounded border border-gray-300 bg-gray-100 px-1 py-px text-[11px] font-medium text-gray-600">
            Social
          </span>
        )}
        {slug === "nico-paoletti" && (
          <span className="absolute top-2 right-2 z-10 flex h-5 w-5 items-center justify-center rounded-full border-2 border-yellow-400 bg-transparent text-[10px] font-bold text-yellow-500">C</span>
        )}
        <CardContent className="flex flex-col items-center px-3 pt-6 pb-4 h-full">
          {/* Avatar */}
          <div className="relative mb-3 h-20 w-20 shrink-0 overflow-hidden rounded-full ring-2 ring-primary/20">
            {photoUrl ? (
              <Image
                src={photoUrl}
                alt={name}
                fill
                className="object-cover"
                sizes="80px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary/10 text-xl font-bold text-primary">
                {getInitials(name)}
              </div>
            )}
          </div>

          {/* Name */}
          <p className="text-center text-base font-semibold leading-tight">{name}</p>

          {/* Stats */}
          <div className="mt-auto pt-3 w-full">
            {gp > 0 ? (
              <div className="flex justify-around border-t pt-3 text-center">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">GP</p>
                  <p className="text-sm font-semibold">{gp}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Avg</p>
                  <p className="text-sm font-semibold">{strokeAvg.toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Hdcp</p>
                  <p className="text-sm font-semibold">{hdcpAvg.toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Rank</p>
                  <p className="text-sm font-semibold">{rank ?? "—"}</p>
                </div>
              </div>
            ) : (
              <div className="border-t pt-3 text-center text-xs text-muted-foreground">
                No rounds played
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
