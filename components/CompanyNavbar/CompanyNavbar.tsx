"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/company", label: "Tableau de bord", shortLabel: null, exact: true },
  {
    href: "/company/missions",
    label: "Missions",
    shortLabel: "Missions",
    exact: false
  },
  {
    href: "/company/create",
    label: "Créer une mission",
    shortLabel: "Créer",
    exact: false
  }
];

export const CompanyNavbar = () => {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full bg-main-gradient shadow-md">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between gap-2 px-4 sm:px-6">
        <Link
          href="/company"
          className="shrink-0 font-black text-lg tracking-[-0.02em] sm:text-xl"
          aria-label="Cet Extra — tableau de bord"
        >
          <span className="text-white">CET</span>
          <span className="text-[#FDBA3B]">⚡</span>
          <span className="text-white">EXTRA</span>
        </Link>

        <nav
          aria-label="Navigation espace Pro"
          className="flex items-center gap-1"
        >
          {NAV_LINKS.map(({ href, label, shortLabel, exact }) => {
            const isActive = exact
              ? pathname === href
              : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "whitespace-nowrap rounded-lg px-2.5 py-2 font-semibold text-xs transition-colors sm:px-4 sm:text-sm",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDBA3B]",
                  isActive
                    ? "bg-white/15 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white",
                  !shortLabel && "hidden sm:block"
                )}
              >
                {shortLabel && <span className="sm:hidden">{shortLabel}</span>}
                <span className={cn(shortLabel && "hidden sm:inline")}>
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center">
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: "h-9 w-9",
                userButtonAvatarImage: "h-9 w-9 rounded-full"
              }
            }}
          />
        </div>
      </div>
    </header>
  );
};
