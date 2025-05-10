// app/unsubscribe/page.tsx

import prisma from "@/app/lib/prisma";
import { Metadata } from "next";
import Link from "next/link";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Se désinscrire – Cet Extra",
    description: "Se désabonner des notifications du blog Cet Extra.",
    robots: "noindex, follow"
  };
}

export default async function UnsubscribePage({
  searchParams
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  let success = false;
  let error = "";

  if (id) {
    try {
      const updated = await prisma.blogSubscriber.update({
        where: { id, subscribed: true },
        data: { subscribed: false }
      });
      success = updated.subscribed === false;
      if (!success) {
        error = "Ce lien de désinscription n'est plus valide ou déjà utilisé.";
      }
    } catch (e) {
      console.error("Error during unsubscribe:", e);
      error = "Une erreur est survenue lors de la désinscription.";
    }
  } else {
    error = "Lien de désinscription invalide.";
  }

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center p-8">
      <h1 className="mb-4 text-3xl font-bold text-[#22345E]">
        {success ? "Vous êtes désinscrit(e) !" : "Désinscription"}
      </h1>
      <p className="mb-6 text-lg text-gray-700">
        {success
          ? "Vous ne recevrez plus les notifications du blog Cet Extra. Merci de votre confiance !"
          : error}
      </p>
      <Link
        href="/"
        className="inline-block rounded-lg bg-[#FDBA3B] px-6 py-3 font-semibold text-[#22345E] shadow transition hover:bg-[#F15A29] hover:text-white"
      >
        Retour à l’accueil
      </Link>
    </main>
  );
}
