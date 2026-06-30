import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "À propos de Cet Extra | Recrutement d'extras événementiel simplifié",
  description:
    "Découvrez l'histoire de Cet Extra, l'application qui facilite le recrutement d'extras (serveurs, cuisiniers) pour les professionnels de l'événementiel. Simplicité, confiance et proximité au service de la restauration.",
  keywords:
    "recrutement extra, événementiel, restauration, serveur, cuisinier, application, employeur, mission ponctuelle, Cet Extra",
  openGraph: {
    title:
      "À propos de Cet Extra | Recrutement d'extras événementiel simplifié",
    description:
      "Découvrez l'histoire et la mission de Cet Extra, l'application pensée pour simplifier la recherche d'extras en restauration et événementiel.",
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
    <div className="bg-white px-6 py-16">
      <div className="mx-auto max-w-3xl">
        {/* En-tête */}
        <h1 className="mb-6 font-black text-5xl text-employer-primary tracking-[-0.02em] md:text-6xl">
          À propos de
          <br />
          <span>
            CET<span className="text-[#F15A29]">⚡</span>EXTRA
          </span>
        </h1>
        <p className="mb-14 text-employer-text-secondary text-xl">
          L'application qui simplifie le recrutement d'extras pour les
          professionnels de l'événementiel.
        </p>

        {/* Contenu */}
        <div className="space-y-10 text-employer-text-primary">
          <div>
            <h2 className="mb-3 font-bold text-2xl text-employer-primary">
              Ma mission
            </h2>
            <p className="text-employer-text-secondary leading-relaxed">
              Cet Extra est une plateforme que j'ai créée pour faciliter la mise
              en relation rapide et efficace entre employeurs de l'événementiel
              et extras (employés ponctuels), principalement dans la
              restauration. Mon objectif : simplifier le recrutement d'extras
              pour tous les professionnels du secteur.
            </p>
          </div>

          <div>
            <h2 className="mb-3 font-bold text-2xl text-employer-primary">
              Qui suis-je ?
            </h2>
            <p className="text-employer-text-secondary leading-relaxed">
              Je m'appelle Lucas, anciennement maître d'hôtel en restauration
              pendant plus de 10 ans, aujourd'hui développeur web. Après avoir
              observé les difficultés rencontrées par les employeurs pour
              trouver des extras disponibles au bon moment, j'ai décidé de créer
              une solution simple, moderne et intuitive.
            </p>
          </div>

          <div>
            <h2 className="mb-3 font-bold text-2xl text-employer-primary">
              Pourquoi Cet Extra ?
            </h2>
            <p className="mb-4 text-employer-text-secondary leading-relaxed">
              L'idée de Cet Extra m'est venue d'une expérience vécue : chaque
              lundi, mon ancien employeur en traiteur passait des heures à
              contacter, un par un, tous les extras potentiels pour savoir s'ils
              étaient disponibles le week-end suivant. Un processus long,
              fastidieux, peu efficace.
            </p>
            <p className="text-employer-text-secondary leading-relaxed">
              Avec Cet Extra, tout change : les employeurs visualisent en un
              coup d'œil les profils disponibles à proximité, peuvent les
              contacter directement et gagnent ainsi un temps précieux dans leur
              organisation.
            </p>
          </div>

          <div>
            <h2 className="mb-4 font-bold text-2xl text-employer-primary">
              Mes valeurs
            </h2>
            <ul className="space-y-3">
              {[
                {
                  label: "Simplicité",
                  desc: "Une interface claire, accessible à tous, pensée pour aller à l'essentiel."
                },
                {
                  label: "Confiance",
                  desc: "Des profils vérifiés et une transparence sur les disponibilités."
                },
                {
                  label: "Proximité",
                  desc: "Une mise en relation locale pour répondre aux besoins urgents des employeurs."
                }
              ].map((v) => (
                <li key={v.label} className="flex gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-employer-primary text-white text-xs">
                    ✓
                  </span>
                  <span className="text-employer-text-secondary">
                    <strong className="text-employer-text-primary">
                      {v.label}
                    </strong>{" "}
                    — {v.desc}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-3 font-bold text-2xl text-employer-primary">
              Ma vision
            </h2>
            <p className="text-employer-text-secondary leading-relaxed">
              Aujourd'hui, Cet Extra cible principalement les postes de serveur
              et cuisinier, mais j'ai l'ambition d'élargir rapidement à d'autres
              métiers de l'événementiel. Je souhaite aussi enrichir
              l'application avec de nouvelles fonctionnalités : statistiques,
              messagerie instantanée, gestion de missions, et déployer le
              service partout en France.
            </p>
          </div>
        </div>

        {/* Restez informés */}
        <div className="mt-16 rounded-2xl border border-employer-border bg-employer-background p-8">
          <h2 className="mb-2 font-bold text-employer-primary text-xl">
            Restez informés
          </h2>
          <p className="mb-6 text-employer-text-secondary">
            Pour suivre l'évolution du projet et découvrir les nouveautés,
            rendez-vous sur le blog.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/blog"
              className="inline-flex items-center justify-center rounded-lg bg-employer-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-employer-secondary"
            >
              Découvrir le blog
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg border border-employer-border bg-white px-6 py-3 font-semibold text-employer-text-primary transition-colors hover:bg-employer-surface"
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
