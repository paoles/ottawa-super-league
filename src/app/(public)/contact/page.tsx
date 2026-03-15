import Image from "next/image";

const COMMISSIONERS = [
  { name: "Nico Paoletti", years: "2025 – Present", src: "/contact/nico.JPG" },
  { name: "Kevin Slack", years: "2023 – 2025", src: "/contact/kevin.jpg" },
  { name: "Blair Watson", years: "2019 – 2023", src: "/contact/blair.jpg" },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 pb-16">
      <h1
        className="text-center text-4xl font-bold text-primary"
        style={{ fontFamily: "var(--font-dancing-script)", WebkitTextStroke: "0.8px currentColor" }}
      >
        Contact Us
      </h1>
      <div className="mx-auto mt-3 mb-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/60" />
        <div className="h-1 w-12 rounded-full bg-primary" />
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/60" />
      </div>

      {/* Join the League */}
      <section className="mx-auto mt-8 max-w-3xl">
        <div className="grid items-center gap-6 sm:grid-cols-2">
          <div className="relative aspect-video overflow-hidden rounded-xl">
            <Image
              src="/contact/group.jpg"
              alt="Ottawa Super League group photo"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 50vw"
            />
          </div>
          <div className="space-y-3">
            <h2
              className="text-3xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-dancing-script)", WebkitTextStroke: "0.6px currentColor" } as React.CSSProperties}
            >
              Join the league!
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Reach out to the league commissioner on Instagram or at{" "}
              <a
                href="mailto:ottawasuperleague.vip@gmail.com"
                className="font-medium text-primary underline underline-offset-2"
              >
                ottawasuperleague.vip@gmail.com
              </a>{" "}
              to inquire about joining.
            </p>
            <p className="text-sm font-semibold text-foreground">
              Follow us via the link below:
            </p>
            <a
              href="https://www.instagram.com/ottawasuperleague/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow Ottawa Super League on Instagram"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-10 w-10"
                aria-hidden="true"
              >
                <defs>
                  <radialGradient id="ig-grad" cx="30%" cy="107%" r="150%">
                    <stop offset="0%" stopColor="#fdf497" />
                    <stop offset="5%" stopColor="#fdf497" />
                    <stop offset="45%" stopColor="#fd5949" />
                    <stop offset="60%" stopColor="#d6249f" />
                    <stop offset="90%" stopColor="#285AEB" />
                  </radialGradient>
                </defs>
                <rect width="24" height="24" rx="6" fill="url(#ig-grad)" />
                <rect x="2.5" y="2.5" width="19" height="19" rx="5" fill="none" stroke="white" strokeWidth="1.5" />
                <circle cx="12" cy="12" r="4.5" fill="none" stroke="white" strokeWidth="1.5" />
                <circle cx="17.5" cy="6.5" r="1.2" fill="white" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Commissioner's Memorial Hall */}
      <section className="mt-16">
        <h2
          className="text-center text-3xl font-bold text-foreground"
          style={{ fontFamily: "var(--font-dancing-script)", WebkitTextStroke: "0.6px currentColor" } as React.CSSProperties}
        >
          Commissioner&apos;s Memorial Hall
        </h2>

        <div className="mx-auto mt-6 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
          {COMMISSIONERS.map((c, i) => (
            <div
              key={c.name}
              className="group overflow-hidden rounded-2xl bg-white shadow-md transition-shadow duration-300 hover:shadow-xl dark:bg-card"
            >
              <div className="relative aspect-square">
                <Image
                  src={c.src}
                  alt={c.name}
                  fill
                  priority={i < 2}
                  className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
              </div>
              <div className="px-3 py-2.5 text-center">
                <p className="text-lg font-semibold text-foreground">{c.name}</p>
                <p className="text-sm text-muted-foreground">{c.years}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
