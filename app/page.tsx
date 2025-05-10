import { CetExtraLogo } from "@/components/icons/CetExtraLogo";
import Head from "next/head";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Head>
        <title>Cet Extra | Plateforme d’extras pour l’évènementiel</title>
        <meta
          name="description"
          content="Cet Extra facilite la recherche d’extras pour les employeurs de l’évènementiel. Suivez l’évolution du projet sur notre blog !"
        />
        <link rel="canonical" href="https://cetextra.fr/" />
        <meta
          property="og:title"
          content="Cet Extra | Plateforme d’extras pour l’évènementiel"
        />
        <meta
          property="og:description"
          content="Trouvez facilement des extras pour vos évènements. Plateforme dédiée aux employeurs de l’évènementiel."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://cetextra.fr/" />
        <meta property="og:image" content="/images/og-image.jpg" />
      </Head>
      <div className="flex w-full flex-1 flex-col items-center justify-center bg-gradient-to-r from-[#22345E] via-[#FDBA3B] to-[#F15A29]">
        <header>
          <div className="mb-8 flex items-center justify-center">
            <CetExtraLogo className="h-60 w-60" aria-label="Logo Cet Extra" />
          </div>
        </header>
        <section className="w-full max-w-xl rounded-2xl border-4 border-[#FDBA3B] bg-white/90 p-8 text-center shadow-2xl">
          <h1 className="mb-4 text-4xl font-extrabold text-[#22345E] md:text-5xl">
            Cet Extra
          </h1>
          <p className="mb-6 text-lg text-[#22345E] md:text-xl">
            Bienvenue sur la page d'accueil de{" "}
            <span className="font-semibold text-[#3CB4E7]">Cet Extra</span> !
          </p>
          <p className="mb-4 text-base text-[#22345E]">
            Cet Extra est une application conçue pour faciliter la recherche
            d'extras par les employeurs de l'évènementiel.
          </p>
          <p className="mb-8 text-base text-[#22345E]">
            Le site est actuellement en construction, mais vous pouvez suivre
            son évolution depuis notre&nbsp;
            <Link
              href="/blog"
              className="font-medium text-[#F15A29] underline transition hover:text-[#FDBA3B]"
            >
              super blog&nbsp;!
            </Link>
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/blog"
              className="inline-block rounded-lg bg-[#FDBA3B] px-6 py-3 font-semibold text-[#22345E] shadow transition hover:bg-[#F15A29] hover:text-white"
            >
              Découvrir le blog
            </Link>
            <Link
              href="/about"
              className="inline-block rounded-lg bg-[#FDBA3B] px-6 py-3 font-semibold text-[#22345E] shadow transition hover:bg-[#F15A29] hover:text-white"
            >
              A propos de nous
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
