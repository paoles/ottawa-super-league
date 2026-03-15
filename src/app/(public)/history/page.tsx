import Image from "next/image";

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
        The History
      </h1>
      <div className="mx-auto mt-3 mb-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/60" />
        <div className="h-1 w-12 rounded-full bg-primary" />
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/60" />
      </div>

      <ChampionSection title="Tour Champions" champions={tourChampions} />
      <ChampionSection title="M.Q. Invitational Champions" champions={mqChampions} />
      <ChampionSection title="O.S. Classic Champions" champions={osChampions} />
    </div>
  );
}
