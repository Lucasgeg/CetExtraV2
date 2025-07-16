import { ClerkProvider, UserButton } from "@clerk/nextjs";
import { CetExtraLogo } from "@/components/icons/CetExtraLogo";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import ErrorBoundary from "@/components/ErrorBoundary/ErrorBoundary";
import Link from "next/link";
export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <div className="mx-auto flex h-full w-full flex-col sm:px-6">
        {/* Header fixe */}
        <header className="relative flex items-center py-2">
          <Link href={"/company"}>
            <CetExtraLogo className="h-16 lg:h-24" />
          </Link>
          <span className="absolute left-1/2 -translate-x-1/2 transform text-2xl lg:text-6xl">
            Bienvenue John Doe
          </span>
          <div className="ml-auto flex gap-1">
            <div className="h-7 w-7 rounded-full">
              <Cog6ToothIcon className="h-full w-full" />
            </div>
            <div className="h-7 w-7">
              <UserButton />
            </div>
          </div>
        </header>

        {/* Contenu principal avec overflow */}
        <main className="my-auto max-h-[80vh] flex-1 overflow-hidden bg-main-gradient px-2 py-6 sm:px-6">
          <div className="relative h-full overflow-y-auto">
            {/* Éléments d'animation en arrière-plan */}
            <div className="pointer-events-none absolute left-1/4 top-1/4 aspect-square w-1/4 max-w-[384px] animate-pulse rounded-full bg-blue-500/10 blur-3xl"></div>
            <div className="pointer-events-none absolute bottom-1/4 right-1/4 aspect-square w-1/5 max-w-[320px] animate-pulse rounded-full bg-purple-500/10 blur-3xl delay-1000"></div>
            <div className="pointer-events-none absolute right-1/3 top-1/2 aspect-square w-1/6 max-w-[256px] animate-pulse rounded-full bg-cyan-500/10 blur-3xl delay-500"></div>

            {/* Contenu de la page */}
            <ErrorBoundary>{children}</ErrorBoundary>
          </div>
        </main>
      </div>
    </ClerkProvider>
  );
}
