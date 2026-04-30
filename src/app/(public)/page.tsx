import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Trophy, BarChart2, Users } from "lucide-react";

export const revalidate = 300;

const SPONSORS = [
  { name: "mycar.ca", logo: "/sponsors/myCar-logo-4.png" },
  { name: "Pinpoint Solutions", logo: "/sponsors/Pinpont%20Logo.avif" },
  { name: "Freedom Convoy 2022", logo: "/sponsors/freedom%20convoy%20logo.png" },
  { name: "The Business Inn & Suites", logo: "/sponsors/TBI_Logo.webp" },
  { name: "The J——er Quotes", logo: "/sponsors/claude-logo-freelogovectors.net_.png" },
  { name: "Métis Nation", logo: "/sponsors/metis%20nation%20logo.webp" },
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
      <section
        className="relative px-4 py-4 text-center sm:py-6"
        style={{
          backgroundImage: "url('/home/Landscape.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-white/70" />
        <div className="relative mx-auto mb-3 max-w-[340px] sm:max-w-[420px]">
          <img
            src="/logo-full.png"
            alt="Ottawa Super League"
            className="mx-auto w-full object-contain"
          />
        </div>
        <div className="relative mx-auto flex max-w-xs flex-col gap-2.5 sm:max-w-none sm:flex-row sm:justify-center">
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
        <div className="mb-6">
          <h2
            className="mb-2 text-3xl sm:text-4xl text-primary"
            style={{ fontFamily: "var(--font-dancing-script)" }}
          >
            Proudly Sponsored By
          </h2>
          <div className="flex items-center justify-center gap-2">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary/60" />
            <div className="h-1 w-10 rounded-full bg-primary" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary/60" />
          </div>
        </div>
        <div className="mx-auto grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {SPONSORS.map((s) => (
            <div
              key={s.name}
              className="flex h-28 items-center justify-center rounded-lg border bg-white p-3 sm:h-32 sm:p-4"
            >
              <img
                src={s.logo}
                alt={s.name}
                className="max-h-20 max-w-full object-contain sm:max-h-24"
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
