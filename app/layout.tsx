import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AnimatedBG } from "@/components/ui/AnimatedBG/AnimatedBG";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: {
    default: "Cet Extra | Plateforme d’extras pour l’évènementiel",
    template: "%s | Cet Extra"
  },
  description:
    "Plateforme dédiée au recrutement d’extras pour l’évènementiel et la restauration. Employeurs : trouvez serveurs, cuisiniers et extras disponibles près de chez vous en quelques clics. Solution simple, rapide et fiable.",
  metadataBase: new URL("https://cetextra.fr"),
  openGraph: {
    title: "Cet Extra | Plateforme d’extras pour l’évènementiel",
    description:
      "Simplifiez la recherche d’extras pour vos évènements. Plateforme innovante pour les employeurs de l’évènementiel.",
    url: "https://cetextra.fr/",
    type: "website",
    images: [
      {
        url: "/cetextralogo.jpeg",
        width: 1200,
        height: 630,
        alt: "Cet Extra - Plateforme d’extras pour l’évènementiel"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Cet Extra | Plateforme d’extras pour l’évènementiel",
    description:
      "Trouvez rapidement des extras pour vos évènements grâce à Cet Extra. Plateforme dédiée aux professionnels de l’évènementiel.",
    images: ["/cetextralogo.jpeg"]
  },
  alternates: {
    canonical: "/"
  },
  icons: {
    icon: "/favicon.png"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} mx-auto max-w-screen-xl`}
      >
        <AnimatedBG />
        <main className="flex min-h-screen flex-col items-center bg-gradient-to-br from-indigo-50 via-white to-blue-100">
          <nav className="flex w-full justify-center border-b-4 border-[#FDBA3B] bg-white/90 py-3 shadow-md">
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
          </nav>
          {children}
        </main>
      </body>
    </html>
  );
}
