import { ExternalLink } from "lucide-react";
import Image from "next/image";

type PastSeason = { year: number; label: string; href: string };

const PAST_SEASONS: PastSeason[] = [
  { year: 2025, label: "2025", href: "https://sites.google.com/view/ottawasuperleague/home" },
  { year: 2024, label: "2024", href: "https://docs.google.com/spreadsheets/d/1ZoMV2t79_rCe5KIE_NKrOGLr00vIBPzxzktb7n0BN3I/edit?usp=sharing" },
  { year: 2023, label: "2023", href: "https://docs.google.com/spreadsheets/d/1W_bbeeN655qQAmBfaN3KNNWGu8GA2xbJGeAf6jcZafY/edit?usp=sharing" },
  { year: 2022, label: "2022", href: "https://docs.google.com/spreadsheets/d/1tXn7xPibNuA_xPGhtR1d5Whxw4TYrfSeMkk0G4oIJKA/edit?usp=sharing" },
  { year: 2021, label: "2021", href: "https://docs.google.com/spreadsheets/d/1Wg8OFH6vxynsnfOzZlA63XxRfls3wqAnoFaOSo4ygNk/edit?usp=sharing" },
  { year: 2020, label: "2020", href: "https://docs.google.com/spreadsheets/d/19OYYJ9YrkGryJv07FQ6mGngtyvMLheQRq1746M3UhSc/edit?usp=sharing" },
  { year: 2019, label: "2019", href: "https://docs.google.com/spreadsheets/d/1zJhJokpshlhFSN0zX9gyqpR1MelB50LzgmtvmrPA2V8/edit?usp=sharing" },
];

const tourChampions = [
  { year: 2025, name: "Justin vanBergen-Sciuk", src: "/winners/summer%20tour/2025.png" },
  { year: 2024, name: "Kevin Slack", src: "/winners/summer%20tour/2024.png" },
  { year: 2023, name: "Kevin Slack", src: "/winners/summer%20tour/2023.png" },
  { year: 2022, name: "Kevin Slack", src: "/winners/summer%20tour/2022.png" },
  { year: 2021, name: "Luke Janisse", src: "/winners/summer%20tour/2021.png" },
  { year: 2020, name: "Rod Archer", src: "/winners/summer%20tour/2020.png" },
  { year: 2019, name: "Gavin Bradley", src: "/winners/summer%20tour/2019.png" },
];

const mqChampions = [
  { year: 2025, name: "Nico Paoletti", src: "/winners/mq%20invitational/2025.png" },
  { year: 2024, name: "Peter Carniglia", src: "/winners/mq%20invitational/2024.png" },
  { year: 2023, name: "Daniel Perry", src: "/winners/mq%20invitational/2023.png" },
  { year: 2022, name: "Blair Watson", src: "/winners/mq%20invitational/2022.png" },
  { year: 2021, name: "Nico Paoletti", src: "/winners/mq%20invitational/2021.png" },
  { year: 2020, name: "Luke Janisse", src: "/winners/mq%20invitational/2020.png" },
];

const osChampions = [
  { year: 2025, name: "Kevin Slack & Peter Carniglia", src: "/winners/os%20classic/2025.png" },
];

function SectionDivider() {
  return (
    <div className="mx-auto mt-2 mb-6 flex items-center gap-3">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/60" />
      <div className="h-1 w-8 rounded-full bg-primary" />
      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/60" />
    </div>
  );
}

function ChampionCard({
  name,
  year,
  src,
  priority = false,
}: {
  name: string;
  year: number;
  src: string;
  priority?: boolean;
}) {
  return (
    <div className="group overflow-hidden rounded-2xl bg-white shadow-md transition-shadow duration-300 hover:shadow-xl dark:bg-card">
      <div className="relative aspect-square">
        <Image
          src={src}
          alt={name + " (" + year + ")"}
          fill
          priority={priority}
          className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </div>
      <div className="px-3 py-2.5 text-center">
        <p className="text-sm font-semibold text-foreground">{name}</p>
        <p className="text-xs text-muted-foreground">{year}</p>
      </div>
    </div>
  );
}

function ChampionSection({
  title,
  champions,
}: {
  title: string;
  champions: { year: number; name: string; src: string }[];
}) {
  return (
    <section className="mt-14">
      <h2
        className="text-center text-3xl font-bold text-foreground"
        style={{ fontFamily: "var(--font-dancing-script)", WebkitTextStroke: "0.6px currentColor" } as React.CSSProperties}
      >
        {title}
      </h2>

<div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {champions.map((c, i) => (
          <ChampionCard key={c.year + "-" + c.name} priority={i < 2} {...c} />
        ))}
      </div>
    </section>
  );
}

export default function HistoryPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 pb-16">
      <h1
        className="text-center text-4xl font-bold text-primary"
        style={{ fontFamily: "var(--font-dancing-script)", WebkitTextStroke: "0.8px currentColor" }}
      >
        Our History
      </h1>
      <div className="mx-auto mt-3 mb-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/60" />
        <div className="h-1 w-12 rounded-full bg-primary" />
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/60" />
      </div>

      {/* Data Archive Links */}
      <div className="text-center">
        <p className="mb-2.5 text-xs font-medium text-muted-foreground">Data Archive Links</p>
        <div className="flex flex-col items-center gap-2">
          {[PAST_SEASONS.slice(0, 4), PAST_SEASONS.slice(4)].map((row, i) => (
            <div key={i} className="flex gap-2">
              {row.map((s) => (
                <a
                  key={s.year}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-14 items-center justify-center gap-1 rounded-full border border-primary/25 bg-primary/5 px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/15"
                >
                  {s.label}
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>

      <ChampionSection title="Tour Champions" champions={tourChampions} />
      <ChampionSection title="M.Q. Invitational Champions" champions={mqChampions} />
      <ChampionSection title="O.S. Classic Champions" champions={osChampions} />
    </div>
  );
}
