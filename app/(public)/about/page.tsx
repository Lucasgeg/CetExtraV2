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
    <div className="flex w-full flex-1 items-center py-8 sm:py-12">
      <section className="grid w-full gap-6 lg:grid-cols-[1fr_0.85fr]">
        <div className="rounded-[2rem] border border-public-line bg-public-paper-alt p-8 shadow-paper sm:p-10">
          <p className="text-xs uppercase tracking-[0.35em] text-public-teal">
            Pourquoi Cet Extra
          </p>
          <h1 className="mt-4 font-display text-4xl leading-tight text-public-ink sm:text-5xl">
            Une réponse simple à un problème très concret.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-public-ink/80">
            J’ai construit Cet Extra pour éviter les appels en cascade, les
            feuilles dispersées et les disponibilités perdues. L'idée est de
            rendre visibles les bonnes personnes au bon moment.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              [
                "Simplicité",
                "Une interface claire, pensée pour aller droit à l'essentiel."
              ],
              [
                "Confiance",
                "Des profils lisibles et un cadre qui aide à décider vite."
              ],
              [
                "Proximité",
                "Une mise en relation locale pour répondre aux besoins urgents."
              ],
              [
                "Évolution",
                "Une base solide pour ajouter la messagerie, les statistiques et les missions."
              ]
            ].map(([title, text]) => (
              <div
                key={title}
                className="rounded-2xl border border-public-line bg-public-paper px-5 py-5"
              >
                <h2 className="font-display text-2xl text-public-clay">
                  {title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-public-ink/70">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[2rem] border border-public-ink bg-public-ink p-8 text-public-paper shadow-paper">
            <p className="text-xs uppercase tracking-[0.35em] text-public-brass/90">
              À propos de moi
            </p>
            <h2 className="mt-4 font-display text-3xl leading-tight">
              Ancien maître d'hôtel, aujourd'hui développeur web.
            </h2>
            <p className="mt-4 text-sm leading-7 text-public-paper/80">
              J’ai vu de près le temps perdu à appeler un à un les extras pour
              savoir qui était disponible le week-end suivant. Cet outil est né
              de ce moment-là : rendre le tri plus rapide, plus lisible et plus
              utile.
            </p>
          </div>

          <div className="rounded-[2rem] border border-public-line bg-public-paper px-6 py-6 shadow-card">
            <p className="text-xs uppercase tracking-[0.35em] text-public-teal">
              Rester informé
            </p>
            <p className="mt-3 text-sm leading-6 text-public-ink/70">
              Le blog raconte les évolutions du projet et les prochaines étapes.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/blog"
                className="inline-flex items-center rounded-full border border-public-ink bg-public-ink px-4 py-2 text-sm text-public-paper transition hover:border-public-clay hover:bg-public-clay"
              >
                Découvrir le blog
              </Link>
              <Link
                href="/"
                className="inline-flex items-center rounded-full border border-public-line bg-public-paper-alt px-4 py-2 text-sm text-public-ink transition hover:border-public-brass hover:bg-public-paper"
              >
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
