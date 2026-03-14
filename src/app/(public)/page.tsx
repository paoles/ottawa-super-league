import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Trophy, BarChart2, Users } from "lucide-react";

export const revalidate = 300;

const SPONSORS = [
  { name: "mycar.ca" },
  { name: "Pinpoint Solutions" },
  { name: "Freedom Convoy 2022" },
  { name: "The Business Inn & Suites" },
  { name: "The J——er Quotes" },
];

const QUICK_LINKS = [
  { href: "/leaderboard", icon: Trophy, label: "Leaderboard", desc: "Season standings" },
  { href: "/statistics", icon: BarChart2, label: "Statistics", desc: "Scores & trends" },
  { href: "/players", icon: Users, label: "Players", desc: "Player profiles" },
];

export default async function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-white px-4 py-6 text-center sm:py-10">
        <div className="mx-auto max-w-[260px] sm:max-w-[300px]">
          <img
            src="/logo-full.png"
            alt="Ottawa Super League"
            className="mx-auto w-full object-contain"
          />
        </div>
        <div className="mt-2 mb-5">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wide text-primary">
            Summer Tour 2025
          </span>
        </div>
        <div className="mx-auto flex max-w-xs flex-col gap-2.5 sm:max-w-none sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/scores">Input Score</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="w-full sm:w-auto border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <a
              href="https://www.tee-on.com/PubGolf/servlet/com.teeon.teesheet.servlets.golfersection.ComboLanding?CourseCode=TMCC&FromCourseWebsite=true"
              target="_blank"
              rel="noopener noreferrer"
            >
              Book a Tee Time
            </a>
          </Button>
        </div>
      </section>

      {/* Quick Links */}
      <section className="bg-[#186732] px-4 py-6">
        <div className="mx-auto grid max-w-sm grid-cols-3 gap-3">
          {QUICK_LINKS.map(({ href, icon: Icon, label, desc }) => (
            <Link key={href} href={href} className="group">
              <div className="flex flex-col items-center rounded-xl border border-white/20 bg-white/10 px-2 py-4 text-center text-white transition-colors group-hover:bg-white/20">
                <Icon className="mb-2 h-6 w-6" />
                <div className="text-sm font-semibold">{label}</div>
                <div className="mt-0.5 hidden text-[11px] leading-tight text-white/70 sm:block">{desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Sponsors */}
      <section className="border-t bg-white px-4 py-8 text-center">
        <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Proudly sponsored by:
        </p>
        <div className="mx-auto grid max-w-2xl grid-cols-3 gap-3">
          {SPONSORS.slice(0, 3).map((s) => (
            <div
              key={s.name}
              className="flex h-16 items-center justify-center rounded-lg border bg-muted/20 px-3 text-center text-sm font-semibold text-foreground/70"
            >
              {s.name}
            </div>
          ))}
          <div className="col-span-3 grid grid-cols-2 gap-3">
            {SPONSORS.slice(3).map((s) => (
              <div
                key={s.name}
                className="flex h-16 items-center justify-center rounded-lg border bg-muted/20 px-3 text-center text-sm font-semibold text-foreground/70"
              >
                {s.name}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
