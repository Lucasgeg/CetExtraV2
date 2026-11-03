import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AnimatedBG } from "@/components/ui/AnimatedBG/AnimatedBG";
import { SITE_URL } from "@/utils/siteUrl";

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
    "Simplifiez la recherche d’extras pour vos évènements. Plateforme innovante pour les employeurs de l’évènementiel.",
  // Résout les URL relatives (canonical, openGraph…) de toutes les pages
  metadataBase: new URL(SITE_URL),
  // Ni `openGraph.url` ni `alternates.canonical` ici : hérités par toute page
  // qui ne les surcharge pas, ils la feraient pointer vers l'accueil (le
  // canonical de l'accueil est déclaré dans app/page.tsx)
  openGraph: {
    title: "Cet Extra | Plateforme d’extras pour l’évènementiel",
    description:
      "Simplifiez la recherche d’extras pour vos évènements. Plateforme innovante pour les employeurs de l’évènementiel.",
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
      "Simplifiez la recherche d’extras pour vos évènements. Plateforme innovante pour les employeurs de l’évènementiel.",
    images: ["/cetextralogo.jpeg"]
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
    <html lang="fr">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AnimatedBG />
        <div className="mx-auto min-h-screen max-w-screen-3xl">{children}</div>
      </body>
    </html>
  );
}
