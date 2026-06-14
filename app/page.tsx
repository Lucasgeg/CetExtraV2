import { CetExtraLogo } from "@/components/icons/CetExtraLogo";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 items-center py-8 sm:py-12">
      <div className="grid w-full gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="relative overflow-hidden rounded-[2rem] border border-public-line bg-public-paper-alt p-8 shadow-paper sm:p-10 lg:p-12">
          <div className="absolute right-6 top-6 rounded-full border border-public-line bg-public-paper px-4 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-public-ink/60">
            Feuille de service
          </div>

          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.35em] text-public-teal">
              Plateforme de recrutement
            </p>
            <h1 className="mt-4 font-display text-5xl leading-[0.95] text-public-ink sm:text-6xl lg:text-7xl">
              Les extras ne devraient jamais être cherchés à l'aveugle.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-public-ink/80">
              Cet Extra rassemble les disponibilités, les profils et les
              premiers échanges dans un espace clair pour les équipes de
              l'événementiel.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild theme="public" className="px-5">
                <Link href="/sign-up">Créer un compte</Link>
              </Button>
              <Button asChild theme="public" variant="outline" className="px-5">
                <Link href="/blog">Lire le blog</Link>
              </Button>
            </div>

            <dl className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                [
                  "Rapide",
                  "Trouver les bons profils sans courir après les contacts."
                ],
                ["Local", "Voir les extras proches du lieu de mission."],
                [
                  "Lisible",
                  "Garder les échanges et les missions au même endroit."
                ]
              ].map(([title, text]) => (
                <div
                  key={title}
                  className="rounded-2xl border border-public-line bg-public-paper px-4 py-4 shadow-insetLine"
                >
                  <dt className="font-display text-xl text-public-clay">
                    {title}
                  </dt>
                  <dd className="mt-2 text-sm leading-6 text-public-ink/70">
                    {text}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rotate-1 rounded-[2rem] border border-public-ink bg-public-ink p-6 text-public-paper shadow-paper">
            <p className="text-xs uppercase tracking-[0.35em] text-public-brass/90">
              Tableau d'action
            </p>
            <h2 className="mt-3 font-display text-3xl leading-tight">
              Ce qui change quand tout est visible d'un coup d'œil.
            </h2>
            <div className="mt-6 space-y-3">
              {[
                "Publier un besoin précis",
                "Repérer les profils disponibles",
                "Contacter sans perdre le fil"
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                >
                  <span>{item}</span>
                  <span className="h-2.5 w-2.5 rounded-full bg-public-brass" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-public-line bg-public-paper px-6 py-6 shadow-card">
            <p className="text-xs uppercase tracking-[0.35em] text-public-teal">
              Raccourcis
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                ["A propos", "/about"],
                ["Se connecter", "/sign-in"],
                ["S'inscrire", "/sign-up"]
              ].map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="inline-flex items-center rounded-full border border-public-line bg-public-paper-alt px-4 py-2 text-sm text-public-ink transition hover:border-public-brass hover:bg-public-paper"
                >
                  {label}
                </Link>
              ))}
            </div>
            <div className="mt-6 flex items-center gap-4">
              <CetExtraLogo
                className="h-16 w-16 shrink-0"
                aria-label="Logo Cet Extra"
              />
              <p className="text-sm leading-6 text-public-ink/70">
                Une interface pensée pour les équipes qui ont besoin d'aller
                droit au but.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
