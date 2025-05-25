import { CetExtraLogo } from "@/components/icons/CetExtraLogo";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="flex h-full w-full flex-1 flex-col items-center justify-center bg-gradient-to-r from-[#22345E] via-[#FDBA3B] to-[#F15A29] px-6">
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
            <Button asChild theme="company" variant="default">
              <Link href="/blog">Découvrir le blog</Link>
            </Button>
            <Button asChild theme="extra" variant="default">
              <Link href="/about">A propos de nous</Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
