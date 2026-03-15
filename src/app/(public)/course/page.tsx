import Image from "next/image";
import { Button } from "@/components/ui/button";
import { COURSE_RATINGS, PAR } from "@/lib/constants";
import type { Course } from "@/lib/constants";
import { HeroCarousel } from "@/components/course/hero-carousel";

const COURSE_COLORS: Record<Course, string> = {
  North: "#10b981",
  South: "#f43f5e",
  East: "#3b82f6",
  West: "#f59e0b",
};

const DISPLAY_ORDER: Course[] = ["North", "West", "South", "East"];

const HERO_IMAGES: { src: string; alt: string }[] = [
  { src: "/course/hero/1.png", alt: "The Meadows Golf & Country Club" },
  { src: "/course/hero/2.png", alt: "The Meadows Golf & Country Club" },
  { src: "/course/hero/3.png", alt: "The Meadows Golf & Country Club" },
  { src: "/course/hero/4.png", alt: "The Meadows Golf & Country Club" },
];

export default function CoursePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Heading + Divider */}
      <h1
        className="text-center text-4xl font-bold text-primary"
        style={{
          fontFamily: "var(--font-dancing-script)",
          WebkitTextStroke: "0.8px currentColor",
        }}
      >
        The Course
      </h1>
      <div className="mx-auto mt-3 mb-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/60" />
        <div className="h-1 w-12 rounded-full bg-primary" />
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/60" />
      </div>

      {/* Meadows Logo */}
      <div className="mx-auto max-w-[200px] sm:max-w-[260px]">
        <Image
          src="/course/Meadows%20Logo.png"
          alt="The Meadows Golf & Country Club"
          width={520}
          height={200}
          className="w-full object-contain"
          priority
        />
      </div>

      {/* Hero Carousel */}
      <HeroCarousel images={HERO_IMAGES} />

      {/* Description */}
      <div className="mx-auto mt-8 max-w-2xl text-center">
        <p className="text-base leading-relaxed text-muted-foreground">
          The Meadows Golf &amp; Country Club is the largest public golf
          facility in Eastern Ontario. Featuring 36 world-class holes divided
          into four distinct nine-hole courses, you may combine courses for a
          new challenge every time you visit.
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="mt-6 flex flex-col items-center gap-2.5 sm:flex-row sm:justify-center">
        <Button
          asChild
          size="lg"
          className="w-full sm:w-auto"
        >
          <a
            href="https://themeadowsgolf.ca/meadows"
            target="_blank"
            rel="noopener noreferrer"
          >
            Course Website
          </a>
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

      {/* The Four Nines */}
      <section className="mt-12">
        <h2
          className="mb-5 text-center text-3xl font-bold text-foreground"
          style={{ fontFamily: "var(--font-dancing-script)" }}
        >
          The Four Nines
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {DISPLAY_ORDER.map((course) => {
            const ratings = COURSE_RATINGS[course];
            const color = COURSE_COLORS[course];
            return (
              <div
                key={course}
                className="rounded-xl border-2 p-4 text-center"
                style={{ borderColor: color }}
              >
                <h3
                  className="text-lg font-semibold"
                  style={{ color }}
                >
                  {course}
                </h3>
                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Par {PAR}
                </p>
                <div className="mt-3 space-y-2">
                  <div className="rounded-md bg-muted/40 px-2 py-1.5">
                    <p className="text-xs font-medium text-muted-foreground">White Tees</p>
                    <p className="text-sm">
                      CR {ratings.White.cr.toFixed(1)} · Slope {ratings.White.slope}
                    </p>
                  </div>
                  <div className="rounded-md bg-blue-50 px-2 py-1.5">
                    <p className="text-xs font-medium text-blue-600">Blue Tees</p>
                    <p className="text-sm">
                      CR {ratings.Blue.cr.toFixed(1)} · Slope {ratings.Blue.slope}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Course Map */}
      <section className="mt-12">
        <h2
          className="mb-5 text-center text-3xl font-bold text-foreground"
          style={{ fontFamily: "var(--font-dancing-script)" }}
        >
          Course Layout
        </h2>
        <div className="mx-auto max-w-2xl overflow-hidden rounded-xl border">
          <Image
            src="/course/Map%20Update.png"
            alt="The Meadows course layout map"
            width={1024}
            height={768}
            className="w-full object-contain"
            sizes="(max-width: 672px) 100vw, 672px"
          />
        </div>
      </section>

      {/* Google Maps */}
      <section className="mt-12">
        <h2
          className="mb-5 text-center text-3xl font-bold text-foreground"
          style={{ fontFamily: "var(--font-dancing-script)" }}
        >
          Course Location
        </h2>
        <div className="overflow-hidden rounded-xl border">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2806.6!2d-75.5654473!3d45.3315279!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4cce0bcafc869d75%3A0x65d2dafaca658722!2sThe%20Meadows%20Golf%20%26%20Country%20Club!5e1!3m2!1sen!2sca"
            width="100%"
            height="300"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="The Meadows Golf & Country Club location"
            className="sm:h-[400px]"
          />
        </div>
      </section>
    </div>
  );
}
