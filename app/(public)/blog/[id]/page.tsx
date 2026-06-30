import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import prisma from "@/app/lib/prisma";
import AddCommentForm from "@/components/ui/AddCommentForm/AddCommentForm";
import CommentsList from "@/components/ui/CommentList/CommentList";

type BlogPostPageParams = {
  id: string;
};

export async function generateStaticParams() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    select: { shortUrl: true },
    take: 10
  });

  return posts.map((post) => ({
    id: post.shortUrl
  }));
}

export async function generateMetadata(props: {
  params: Promise<BlogPostPageParams>;
}): Promise<Metadata> {
  const params = await props.params;
  const { id } = params;

  const post = await prisma.blogPost.findUnique({
    where: { shortUrl: id, published: true },
    select: { title: true, shortDesc: true, keywords: true, shortUrl: true }
  });
  if (!post) return {};

  return {
    title: `${post.title} | Cet Extra`,
    description: post.shortDesc,
    keywords: Array.isArray(post.keywords)
      ? post.keywords.join(", ")
      : post.keywords,
    openGraph: {
      title: `${post.title} | Cet Extra`,
      description: post.shortDesc,
      url: `https://cetextra.fr/blog/${post.shortUrl}`,
      type: "article",
      images: [
        {
          url: "/cetextralogo.jpeg",
          width: 1200,
          height: 630,
          alt: "Cet Extra - Plateforme d'extras pour l'évènementiel"
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} | Cet Extra`,
      description: post.shortDesc,
      images: ["/cetextralogo.jpeg"]
    },
    alternates: {
      canonical: `https://cetextra.fr/blog/${post.shortUrl}`
    }
  };
}

export default async function BlogPostPage(props: {
  params: Promise<BlogPostPageParams>;
}) {
  const params = await props.params;
  const { id } = params;
  const post = await prisma.blogPost.findUnique({
    where: { shortUrl: id, published: true }
  });
  if (!post) return notFound();

  const MarkdownComponents: Components = {
    img: ({ src, alt }) => {
      const cloudinaryRegex =
        /res\.cloudinary\.com\/[^/]+\/upload\/(?:v\d+\/)?(.+)/;
      const match = typeof src === "string" ? src.match(cloudinaryRegex) : null;

      if (match) {
        const publicId = match[1];
        return (
          <div className="my-4">
            <Image
              width={1200}
              height={800}
              src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}`}
              alt={alt || "Image de l'article"}
              className="rounded-lg"
              sizes="(max-width: 768px) 100vw, 80vw"
              quality={100}
            />
            {alt && (
              <p className="mt-2 text-center text-employer-text-secondary text-sm">
                {alt}
              </p>
            )}
          </div>
        );
      }

      const fallbackSrc = typeof src === "string" ? src : "/placeholder.jpg";
      return (
        <div className="relative my-4 h-[400px] w-full">
          <Image
            src={fallbackSrc}
            alt={alt || "Image de l'article"}
            fill
            className="rounded-lg object-contain"
            sizes="(max-width: 768px) 100vw, 80vw"
          />
        </div>
      );
    }
  };

  return (
    <div className="bg-white px-6 py-16">
      <div className="mx-auto max-w-3xl">
        {/* En-tête article */}
        <div className="mb-10">
          <Link
            href="/blog"
            className="mb-6 inline-flex items-center gap-1 font-semibold text-employer-text-secondary text-sm transition-colors hover:text-employer-primary"
          >
            ← Retour au blog
          </Link>
          <h1 className="mt-4 font-black text-4xl text-employer-primary tracking-[-0.02em] md:text-5xl">
            {post.title}
          </h1>
          <p className="mt-3 text-employer-text-secondary text-sm">
            {new Date(post.createdAt).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric"
            })}
          </p>
        </div>

        {/* Contenu */}
        <article className="prose prose-lg max-w-none prose-a:text-[#F15A29] prose-headings:text-employer-primary text-employer-text-primary prose-a:underline hover:prose-a:text-[#FDBA3B]">
          <ReactMarkdown components={MarkdownComponents}>
            {post.content}
          </ReactMarkdown>
        </article>

        {/* Navigation bas de page */}
        <div className="mt-12 flex flex-wrap gap-3 border-employer-border border-t pt-8">
          <Link
            href="/blog"
            className="inline-flex items-center justify-center rounded-lg bg-employer-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-employer-secondary"
          >
            Retour au blog
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-employer-border bg-white px-6 py-3 font-semibold text-employer-text-primary transition-colors hover:bg-employer-surface"
          >
            Accueil
          </Link>
        </div>

        {/* Commentaires */}
        <section className="mt-16">
          <h2 className="mb-6 font-bold text-2xl text-employer-primary">
            Commentaires
          </h2>
          <CommentsList postId={post.id} />
          <AddCommentForm postId={post.id} />
        </section>
      </div>
    </div>
  );
}
