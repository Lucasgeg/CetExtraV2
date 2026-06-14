import prisma from "@/app/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Blog Cet Extra – Recrutement extras événementiel & actus",
  description:
    "Découvrez toutes les actualités, conseils et nouveautés de la plateforme Cet Extra (cet extra) dédiée au recrutement d’extras pour l’événementiel et la restauration.",
  keywords: [
    "Cet Extra",
    "cet extra",
    "blog événementiel",
    "recrutement extra",
    "extras restauration",
    "actualités extras",
    "emploi événementiel"
  ],
  openGraph: {
    title: "Blog Cet Extra – Recrutement extras événementiel & actus",
    description:
      "Toutes les actualités et conseils sur le recrutement d’extras en événementiel avec la plateforme Cet Extra.",
    url: "https://www.cetextra.fr/blog",
    type: "website",
    images: [
      {
        url: "/cetextralogo.jpeg",
        width: 1200,
        height: 630,
        alt: "Blog Cet Extra – Plateforme d’extras pour l’événementiel"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog Cet Extra – Recrutement extras événementiel & actus",
    description:
      "Toutes les actualités et conseils sur le recrutement d’extras en événementiel avec la plateforme Cet Extra.",
    images: ["/cetextralogo.jpeg"]
  },
  alternates: {
    canonical: "https://www.cetextra.fr/blog"
  }
};

export default async function BlogListPage() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      shortDesc: true,
      createdAt: true,
      shortUrl: true
    }
  });

  return (
    <div className="flex h-full w-full flex-1 flex-col overflow-y-auto py-8 sm:py-12">
      <section className="rounded-[2rem] border border-public-line bg-public-paper-alt p-8 shadow-paper sm:p-10">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.35em] text-public-teal">
            Journal du projet
          </p>
          <h1 className="mt-4 font-display text-4xl leading-tight text-public-ink sm:text-5xl">
            Le blog Cet Extra
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-public-ink/75">
            Des nouvelles du produit, des idées de terrain et les prochaines
            étapes pour rendre le recrutement d'extras plus simple.
          </p>
        </div>

        <ul className="mt-10 space-y-5 text-public-ink">
          {posts.map((post) => (
            <li
              key={post.id}
              className="rounded-[1.5rem] border border-public-line bg-public-paper p-6 transition hover:-translate-y-0.5 hover:border-public-brass hover:shadow-card"
            >
              <h2 className="font-display text-2xl text-public-clay">
                <Link
                  href={`/blog/${post.shortUrl}`}
                  className="transition hover:text-public-teal hover:underline"
                >
                  {post.title}
                </Link>
              </h2>
              <p className="mt-2 text-sm uppercase tracking-[0.25em] text-public-ink/45">
                {new Date(post.createdAt).toLocaleDateString("fr-FR")}
              </p>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-public-ink/75">
                {post.shortDesc}
              </p>
              <Button
                asChild
                theme="public"
                variant="link"
                className="mt-4 px-0 text-base"
              >
                <Link href={`/blog/${post.shortUrl}`}>Lire l'article →</Link>
              </Button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
