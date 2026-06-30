import Link from "next/link";
import { PublicNavbar } from "@/components/PublicNavbar";

const proSteps = [
  {
    icon: "📋",
    title: "Créez une mission",
    desc: "Décrivez le poste, la date, le lieu et le nombre d'extras nécessaires."
  },
  {
    icon: "👥",
    title: "Invitez des extras",
    desc: "Parcourez les profils disponibles à proximité et envoyez vos invitations en un clic."
  },
  {
    icon: "✅",
    title: "Confirmez votre équipe",
    desc: "Gérez les réponses et finalisez votre équipe pour le jour J."
  }
];

const extraSteps = [
  {
    icon: "👤",
    title: "Créez votre profil",
    desc: "Renseignez vos compétences, postes pratiqués et disponibilités géographiques."
  },
  {
    icon: "📬",
    title: "Recevez des invitations",
    desc: "Les entreprises proches de chez vous vous contactent directement pour leurs missions."
  },
  {
    icon: "⚡",
    title: "Acceptez et travaillez",
    desc: "Confirmez votre participation et rendez-vous sur le lieu de l'événement."
  }
];

export default function HomePage() {
  return (
    <>
      <PublicNavbar />

      {/* Hero */}
      <section className="relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden bg-[linear-gradient(135deg,#06041B_0%,#33335E_40%,#FDBA3B_80%,#F15A29_100%)] px-6 py-20">
        <div className="pointer-events-none absolute top-1/2 right-[5%] -translate-y-1/2 select-none text-[240px] leading-none opacity-[0.05]">
          ⚡
        </div>
        <div className="relative mx-auto w-full max-w-screen-xl">
          <h1 className="mb-6 font-black text-5xl text-white tracking-[-0.03em] md:text-7xl">
            Trouvez votre prochain <span className="text-[#FDBA3B]">extra</span>
            <br />
            en quelques clics
          </h1>
          <p className="mb-10 max-w-2xl text-lg text-white/70">
            La plateforme qui connecte les entreprises événementielles avec des
            extras qualifiés pour des missions ponctuelles.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-employer-primary px-8 py-4 font-bold text-lg text-white shadow-lg transition-transform hover:scale-[1.02] hover:bg-employer-secondary"
            >
              🏢 Je recrute
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-extra-primary px-8 py-4 font-bold text-extra-text-primary text-lg shadow-lg transition-transform hover:scale-[1.02] hover:bg-extra-secondary hover:text-white"
            >
              ⚡ Je postule
            </Link>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="bg-white px-6 py-24">
        <div className="mx-auto max-w-screen-xl">
          <h2 className="mb-4 text-center font-black text-4xl text-employer-primary tracking-[-0.02em]">
            Comment ça marche ?
          </h2>
          <p className="mb-16 text-center text-employer-text-secondary text-lg">
            Deux chemins, une même plateforme.
          </p>

          <div className="grid gap-16 md:grid-cols-2">
            {/* Colonne Pro */}
            <div>
              <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-employer-border bg-employer-surface px-4 py-1.5 font-bold text-employer-primary text-xs uppercase tracking-[0.1em]">
                🏢 Entreprise
              </div>
              <div className="space-y-8">
                {proSteps.map((step, i) => (
                  <div key={step.title} className="flex gap-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-employer-primary font-bold text-white">
                      {i + 1}
                    </div>
                    <div>
                      <h3 className="mb-1 font-bold text-employer-text-primary">
                        {step.icon} {step.title}
                      </h3>
                      <p className="text-employer-text-secondary text-sm">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Colonne Extra */}
            <div>
              <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-extra-border bg-extra-surface px-4 py-1.5 font-bold text-extra-text-primary text-xs uppercase tracking-[0.1em]">
                ⚡ Extra
              </div>
              <div className="space-y-8">
                {extraSteps.map((step, i) => (
                  <div key={step.title} className="flex gap-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-extra-primary font-bold text-extra-text-primary">
                      {i + 1}
                    </div>
                    <div>
                      <h3 className="mb-1 font-bold text-employer-text-primary">
                        {step.icon} {step.title}
                      </h3>
                      <p className="text-employer-text-secondary text-sm">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-employer-background px-6 py-24 text-center">
        <div className="mx-auto max-w-xl">
          <h2 className="mb-4 font-black text-4xl text-employer-primary tracking-[-0.02em]">
            Prêt à rejoindre{" "}
            <span>
              CET<span className="text-[#F15A29]">⚡</span>EXTRA
            </span>{" "}
            ?
          </h2>
          <p className="mb-10 text-employer-text-secondary text-lg">
            Inscrivez-vous gratuitement et commencez à connecter votre équipe
            aujourd'hui.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-employer-primary px-8 py-4 font-bold text-lg text-white shadow-lg transition-transform hover:scale-[1.02] hover:bg-employer-secondary"
          >
            Commencer — c'est gratuit ⚡
          </Link>
        </div>
      </section>
    </>
  );
}
