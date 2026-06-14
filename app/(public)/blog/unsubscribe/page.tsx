// app/unsubscribe/page.tsx

import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import prisma from "@/app/lib/prisma";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Se désinscrire – Cet Extra",
    description: "Se désabonner des notifications du blog Cet Extra.",
    robots: "noindex, follow"
  };
}

async function handleUnsubscribe(formData: FormData) {
  "use server";

  const email = formData.get("email") as string;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    redirect("/blog/unsubscribe?error=Adresse e-mail invalide");
  }

  let subscriber;

  try {
    subscriber = await prisma.blogSubscriber.findUnique({
      where: { email }
    });
  } catch (error) {
    console.error("Database error during unsubscribe:", error);
    redirect(
      "/blog/unsubscribe?error=Une erreur est survenue lors de la désinscription"
    );
  }

  if (!subscriber) {
    redirect(
      "/blog/unsubscribe?error=Cette adresse e-mail n'est pas inscrite à notre newsletter"
    );
  }

  if (!subscriber.subscribed) {
    redirect(
      "/blog/unsubscribe?error=Vous êtes déjà désinscrit(e) de notre newsletter"
    );
  }

  try {
    await prisma.blogSubscriber.update({
      where: { email },
      data: { subscribed: false }
    });
  } catch (error) {
    console.error("Database error during unsubscribe update:", error);
    redirect(
      "/blog/unsubscribe?error=Une erreur est survenue lors de la désinscription"
    );
  }

  redirect("/blog/unsubscribe?success=true");
}

export default async function UnsubscribePage({
  searchParams
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { success, error } = await searchParams;

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center py-8 sm:py-12">
      <div className="w-full max-w-lg rounded-[2rem] border border-public-line bg-public-paper-alt p-8 shadow-paper">
        <h1 className="text-center font-display text-4xl text-public-ink">
          Se désinscrire
        </h1>

        {success ? (
          <div className="text-center">
            <div className="mb-4 text-public-teal">
              <svg
                className="mx-auto mb-4 h-16 w-16"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="mb-6 text-lg leading-8 text-public-ink/75">
              Vous êtes maintenant désinscrit(e) ! Vous ne recevrez plus les
              notifications du blog Cet Extra. Merci de votre confiance !
            </p>
          </div>
        ) : (
          <>
            <p className="mb-6 text-center text-sm leading-7 text-public-ink/75">
              Entrez votre adresse e-mail pour vous désinscrire des
              notifications du blog Cet Extra.
            </p>

            {error && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                {error}
              </div>
            )}

            <form action={handleUnsubscribe} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-public-ink"
                >
                  Adresse e-mail
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full rounded-2xl border border-public-line bg-public-paper px-4 py-3 text-public-ink placeholder:text-public-ink/35 focus:border-public-brass focus:outline-none focus:ring-2 focus:ring-public-brass/20"
                  placeholder="votre@email.com"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-public-clay px-6 py-3 font-semibold text-white shadow transition hover:bg-public-clay/90 focus:outline-none focus:ring-2 focus:ring-public-clay/20"
              >
                Me désinscrire
              </button>
            </form>
          </>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-public-line bg-public-paper px-5 py-2.5 font-medium text-public-ink transition hover:border-public-brass hover:bg-public-paper-alt"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
