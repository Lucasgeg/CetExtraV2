// app/about/page.tsx
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "À propos de Cet Extra | Recrutement d’extras événementiel simplifié",
  description:
    "Découvrez l’histoire de Cet Extra, l’application qui facilite le recrutement d’extras (serveurs, cuisiniers) pour les professionnels de l’événementiel. Simplicité, confiance et proximité au service de la restauration.",
  keywords:
    "recrutement extra, événementiel, restauration, serveur, cuisinier, application, employeur, mission ponctuelle, Cet Extra",
  openGraph: {
    title:
      "À propos de Cet Extra | Recrutement d’extras événementiel simplifié",
    description:
      "Découvrez l’histoire et la mission de Cet Extra, l’application pensée pour simplifier la recherche d’extras en restauration et événementiel.",
    url: "https://cetextra.fr/about",
    type: "website",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Logo Cet Extra"
      }
    ]
  },
  alternates: {
    canonical: "https://cetextra.fr/about"
  }
};

export default function AboutPage() {
  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center bg-gradient-to-r from-[#22345E] via-[#FDBA3B] to-[#F15A29]">
      <section className="w-full max-w-2xl rounded-2xl border-4 border-[#FDBA3B] bg-white/90 p-8 text-center shadow-2xl">
        <h1 className="mb-4 text-4xl font-extrabold text-[#22345E] md:text-5xl">
          À propos de Cet Extra
        </h1>
        <p className="mb-6 text-lg text-[#22345E] md:text-xl">
          L’application qui simplifie le recrutement d’extras pour les
          professionnels de l’événementiel.
        </p>

        <div className="mb-6 space-y-4 text-left text-[#22345E]">
          <h2 className="text-2xl font-bold text-[#F15A29]">Ma mission</h2>
          <p>
            Cet Extra est une plateforme que j’ai créée pour faciliter la mise
            en relation rapide et efficace entre employeurs de l’événementiel et
            extras (employés ponctuels), principalement dans la restauration.
            Mon objectif : simplifier le recrutement d’extras pour tous les
            professionnels du secteur.
          </p>

          <h2 className="text-2xl font-bold text-[#F15A29]">
            Qui suis-je&nbsp;?
          </h2>
          <p>
            Je m’appelle Lucas, anciennement maître d'hotel en restauration
            pendant plus de 10 ans, aujourd’hui développeur web. Après avoir
            observé les difficultées rencontrées par les employeurs pour trouver
            des extras disponibles au bon moment, j’ai décidé de créer une
            solution simple, moderne et intuitive.
          </p>

          <h2 className="text-2xl font-bold text-[#F15A29]">
            Pourquoi Cet Extra&nbsp;?
          </h2>
          <p>
            L’idée de Cet Extra m’est venue d’une expérience vécue&nbsp;: chaque
            lundi, mon ancien employeur en traiteur passait des heures à
            contacter, un par un, tous les extras potentiels pour savoir s’ils
            étaient disponibles le week-end suivant. Un processus long,
            fastidieux, peu efficace.
          </p>
          <p>
            Avec Cet Extra, tout change&nbsp;: les employeurs visualisent en un
            coup d’œil les profils disponibles à proximité, peuvent les
            contacter directement via une messagerie intégrée, et gagnent ainsi
            un temps précieux dans leur organisation.
          </p>

          <h2 className="text-2xl font-bold text-[#F15A29]">Mes valeurs</h2>
          <ul className="list-disc pl-5">
            <li>
              <b>Simplicité</b> : une interface claire, accessible à tous,
              pensée pour aller à l’essentiel.
            </li>
            <li>
              <b>Confiance</b> : des profils vérifiés et une transparence sur
              les disponibilités.
            </li>
            <li>
              <b>Proximité</b> : une mise en relation locale pour répondre aux
              besoins urgents des employeurs.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-[#F15A29]">Ma vision</h2>
          <p>
            Aujourd’hui, Cet Extra cible principalement les postes de serveur et
            cuisinier, mais j’ai l’ambition d’élargir rapidement à d’autres
            métiers de l’événementiel. Je souhaite aussi enrichir l’application
            avec de nouvelles fonctionnalités&nbsp;: statistiques, messagerie
            instantanée, gestion de missions, etc., et déployer le service
            partout en France.
          </p>
        </div>

        <div className="mb-8 text-[#22345E]">
          <h2 className="text-2xl font-bold text-[#F15A29]">Restez informés</h2>
          <p>
            Pour suivre l’évolution du projet, découvrir les nouveautés ou vous
            inscrire aux notifications, rendez-vous sur mon&nbsp;
            <Link
              href="/blog"
              className="font-medium text-[#F15A29] underline transition hover:text-[#FDBA3B]"
            >
              blog&nbsp;!
            </Link>
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <Link
            href="/blog"
            className="inline-block rounded-lg bg-[#FDBA3B] px-6 py-3 font-semibold text-[#22345E] shadow transition hover:bg-[#F15A29] hover:text-white"
          >
            Découvrir le blog
          </Link>
          <Link
            href="/"
            className="inline-block rounded-lg bg-[#FDBA3B] px-6 py-3 font-semibold text-[#22345E] shadow transition hover:bg-[#F15A29] hover:text-white"
          >
            Retour à l'accueil
          </Link>
        </div>
      </section>
    </div>
  );
}
