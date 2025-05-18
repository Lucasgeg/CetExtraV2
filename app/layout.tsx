import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AnimatedBG } from "@/components/ui/AnimatedBG/AnimatedBG";

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
  metadataBase: new URL("https://cetextra.fr"),
  openGraph: {
    title: "Cet Extra | Plateforme d’extras pour l’évènementiel",
    description:
      "Simplifiez la recherche d’extras pour vos évènements. Plateforme innovante pour les employeurs de l’évènementiel.",
    url: "https://www.cetextra.fr",
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
  alternates: {
    canonical: "https://www.cetextra.fr/"
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
        <div className="mx-auto h-screen max-w-screen-xl">{children}</div>
      </body>
    </html>
  );
}
