import prisma from "@/app/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Blog | Cet Extra",
  description:
    "Suivez l'évolution du projet, nos annonces et nos nouveautés sur le blog de Cet Extra."
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
    <div className="flex h-full w-full flex-1 flex-col items-center overflow-y-auto px-6 py-12">
      <section className="max-w-2xl rounded-2xl border-4 border-extra-primary bg-extra-background/90 p-8 shadow-2xl">
        <h1 className="mb-8 text-center text-4xl font-extrabold text-extra-text-primary md:text-5xl">
          Le Blog
        </h1>

        <ul className="space-y-8 text-extra-text-primary">
          {posts.map((post) => (
            <li
              key={post.id}
              className="rounded-lg border border-extra-primary bg-extra-background p-6 shadow-md transition hover:border-extra-secondary hover:shadow-lg"
            >
              <h2 className="mb-2 text-2xl font-semibold text-extra-secondary">
                <Link
                  href={`/blog/${post.shortUrl}`}
                  className="hover:text-extra-primary hover:underline"
                >
                  {post.title}
                </Link>
              </h2>
              <p className="mb-2 text-sm text-extra-text-secondary">
                {new Date(post.createdAt).toLocaleDateString("fr-FR")}
              </p>
              <p className="mb-4 text-extra-text-primary">{post.shortDesc}</p>
              <Button
                asChild
                theme="extra"
                variant="link"
                className="px-0 text-base"
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
