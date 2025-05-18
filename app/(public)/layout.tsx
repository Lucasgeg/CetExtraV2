import { ClerkProvider } from "@clerk/nextjs";
import Link from "next/link";

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <div className="flex min-h-screen flex-col">
        <nav className="h-16 w-full border-b-4 border-[#FDBA3B] bg-white/90 py-3 shadow-md">
          <div className="mx-auto flex h-full max-w-screen-xl items-center justify-center">
            <ul className="flex gap-6">
              <li>
                <Link
                  href="/"
                  className="rounded-lg bg-transparent px-4 py-2 font-semibold text-[#22345E] transition hover:bg-[#F15A29] hover:text-white"
                >
                  Accueil
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="rounded-lg bg-transparent px-4 py-2 font-semibold text-[#22345E] transition hover:bg-[#F15A29] hover:text-white"
                >
                  A propos
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="rounded-lg bg-transparent px-4 py-2 font-semibold text-[#22345E] transition hover:bg-[#F15A29] hover:text-white"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>
        </nav>
        <main className="w-full flex-1 bg-gradient-to-br from-indigo-50 via-white to-blue-100">
          <div className="mx-auto h-full">{children}</div>
        </main>
      </div>
    </ClerkProvider>
  );
}
