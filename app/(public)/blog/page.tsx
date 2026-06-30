import Link from "next/link";
import prisma from "@/app/lib/prisma";

export const metadata = {
  title: "Blog Cet Extra – Recrutement extras événementiel & actus",
  description:
    "Découvrez toutes les actualités, conseils et nouveautés de la plateforme Cet Extra dédiée au recrutement d'extras pour l'événementiel et la restauration.",
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
      "Toutes les actualités et conseils sur le recrutement d'extras en événementiel avec la plateforme Cet Extra.",
    url: "https://www.cetextra.fr/blog",
    type: "website",
    images: [
      {
        url: "/cetextralogo.jpeg",
        width: 1200,
        height: 630,
        alt: "Blog Cet Extra – Plateforme d'extras pour l'événementiel"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog Cet Extra – Recrutement extras événementiel & actus",
    description:
      "Toutes les actualités et conseils sur le recrutement d'extras en événementiel avec la plateforme Cet Extra.",
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
    <div className="bg-white px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-4 font-black text-5xl text-employer-primary tracking-[-0.02em]">
          Le Blog
        </h1>
        <p className="mb-12 text-employer-text-secondary text-lg">
          Actualités, conseils et nouveautés de la plateforme.
        </p>

        {posts.length === 0 ? (
          <p className="text-employer-text-secondary">
            Aucun article publié pour l'instant. Revenez bientôt !
          </p>
        ) : (
          <ul className="space-y-6">
            {posts.map((post) => (
              <li
                key={post.id}
                className="rounded-xl border border-employer-border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <p className="mb-2 font-semibold text-employer-text-secondary text-xs uppercase tracking-[0.1em]">
                  {new Date(post.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}
                </p>
                <h2 className="mb-3 font-bold text-2xl text-employer-primary">
                  <Link
                    href={`/blog/${post.shortUrl}`}
                    className="transition-colors hover:text-employer-secondary"
                  >
                    {post.title}
                  </Link>
                </h2>
                <p className="mb-5 text-employer-text-secondary">
                  {post.shortDesc}
                </p>
                <Link
                  href={`/blog/${post.shortUrl}`}
                  className="inline-flex items-center gap-1 font-semibold text-employer-primary text-sm transition-colors hover:text-employer-secondary"
                >
                  Lire l'article →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
