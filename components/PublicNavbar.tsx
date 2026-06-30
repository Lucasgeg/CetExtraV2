import Link from "next/link";
import { Button } from "@/components/ui/button";

export function PublicNavbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-employer-border border-b bg-white/95 shadow-sm backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-6">
        <Link href="/" className="font-black text-xl tracking-[-0.02em]">
          <span className="text-employer-primary">CET</span>
          <span className="text-[#F15A29]">⚡</span>
          <span className="text-employer-primary">EXTRA</span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          <li>
            <Link
              href="/"
              className="rounded-lg px-4 py-2 font-semibold text-employer-text-primary text-sm transition-colors hover:bg-employer-surface"
            >
              Accueil
            </Link>
          </li>
          <li>
            <Link
              href="/about"
              className="rounded-lg px-4 py-2 font-semibold text-employer-text-primary text-sm transition-colors hover:bg-employer-surface"
            >
              À propos
            </Link>
          </li>
          <li>
            <Link
              href="/blog"
              className="rounded-lg px-4 py-2 font-semibold text-employer-text-primary text-sm transition-colors hover:bg-employer-surface"
            >
              Blog
            </Link>
          </li>
        </ul>

        <div className="flex items-center gap-3">
          <Button
            asChild
            theme="company"
            variant="outline"
            size="sm"
            rounded="lg"
          >
            <Link href="/sign-in">Se connecter</Link>
          </Button>
          <Button
            asChild
            theme="company"
            variant="default"
            size="sm"
            rounded="lg"
          >
            <Link href="/sign-up">S'inscrire</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
