"use client";

import { ClerkProvider } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isBlogAdmin = pathname?.startsWith("/blog/admin");

  return (
    <ClerkProvider>
      <div className="relative min-h-screen overflow-hidden bg-public-paper text-public-ink">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-public-spotlight opacity-90" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-public-grid bg-[length:32px_32px] opacity-[0.22]" />

        <div className="mx-auto flex min-h-screen w-full max-w-screen-3xl flex-col px-4 py-4 sm:px-6 lg:px-8">
          {!isBlogAdmin && (
            <header className="sticky top-0 z-20 mb-6 border-b border-public-line/80 bg-public-paper/90 backdrop-blur">
              <div className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
                <Link href="/" className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-public-line bg-public-paper-alt shadow-paper">
                    <span className="font-display text-lg tracking-tight">
                      CE
                    </span>
                  </span>
                  <span>
                    <span className="block font-display text-2xl tracking-tight">
                      Cet Extra
                    </span>
                    <span className="block text-[0.7rem] uppercase tracking-[0.28em] text-public-ink/60">
                      Recrutement d'extras
                    </span>
                  </span>
                </Link>

                <nav className="flex flex-wrap items-center gap-2">
                  {[
                    ["Accueil", "/"],
                    ["A propos", "/about"],
                    ["Blog", "/blog"],
                    ["Se connecter", "/sign-in"],
                    ["Créer un compte", "/sign-up"]
                  ].map(([label, href]) => (
                    <Button
                      key={href}
                      asChild
                      theme="public"
                      variant="outline"
                      rounded="pill"
                      className="h-10 border-public-line bg-public-paper px-4 text-sm shadow-none"
                    >
                      <Link href={href}>{label}</Link>
                    </Button>
                  ))}
                </nav>
              </div>
            </header>
          )}

          <main className={`flex flex-1 flex-col ${isBlogAdmin ? "" : "pb-8"}`}>
            {children}
          </main>

          {!isBlogAdmin && (
            <footer className="border-t border-public-line/80 py-5 text-sm text-public-ink/60">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p>Une plateforme pensée pour les équipes de terrain.</p>
                <p>
                  Disponible pour les extras, employeurs et lecteurs du blog.
                </p>
              </div>
            </footer>
          )}
        </div>
      </div>
    </ClerkProvider>
  );
}
