"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Shield, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/statistics", label: "Statistics" },
];

const ABOUT_LINKS = [
  { href: "/players", label: "Players" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isAboutActive = ABOUT_LINKS.some((l) => pathname === l.href);

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo-icon.png" alt="OSL" className="h-9 w-9 object-contain" />
          <span className="hidden text-lg font-light text-foreground sm:inline">
            Ottawa Super League
          </span>
        </Link>

        {/* Desktop nav — all right-aligned */}
        <div className="hidden md:flex items-center gap-1">
          <nav className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isAboutActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  About Us
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {ABOUT_LINKS.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link href={link.href}>{link.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          <Link
            href="/scores"
            className={`ml-2 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              pathname === "/scores"
                ? "bg-primary text-primary-foreground"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            Input Score
          </Link>

          <Link
            href="/admin"
            className="ml-1 rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground"
            title="Admin"
          >
            <Shield className="h-4 w-4" />
          </Link>
        </div>

        {/* Mobile: Input Score pill + hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/scores"
            className="rounded-full bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground"
          >
            Input Score
          </Link>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <nav className="mt-8 flex flex-col gap-2">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`rounded-md px-4 py-3 text-base font-medium transition-colors ${
                      pathname === link.href
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                {ABOUT_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`rounded-md px-4 py-3 text-base font-medium transition-colors ${
                      pathname === link.href
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/scores"
                  onClick={() => setOpen(false)}
                  className={`rounded-md px-4 py-3 text-base font-medium transition-colors ${
                    pathname === "/scores"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Input Score
                </Link>
                <div className="mt-auto pt-4 border-t">
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-2 rounded-md px-4 py-3 text-base font-medium transition-colors ${
                      pathname.startsWith("/admin")
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Shield className="h-4 w-4" />
                    Admin
                  </Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
