import prisma from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import AddCommentForm from "@/components/ui/AddCommentForm/AddCommentForm";
import CommentsList from "@/components/ui/CommentList/CommentList";
import type { Components } from "react-markdown";
import Image from "next/image";
import { Button } from "@/components/ui/button";

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
    title: post.title + " | Cet Extra",
    description: post.shortDesc,
    keywords: Array.isArray(post.keywords)
      ? post.keywords.join(", ")
      : post.keywords,
    openGraph: {
      title: post.title + " | Cet Extra",
      description: post.shortDesc,
      url: `https://cetextra.fr/blog/${post.shortUrl}`,
      type: "article",
      images: [
        {
          url: "/cetextralogo.jpeg",
          width: 1200,
          height: 630,
          alt: "Cet Extra - Plateforme d’extras pour l’évènementiel"
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: post.title + " | Cet Extra",
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
      // Extraction de l'ID public Cloudinary depuis l'URL
      const cloudinaryRegex =
        /res\.cloudinary\.com\/[^/]+\/upload\/(?:v\d+\/)?(.+)/;
      const match = src?.match(cloudinaryRegex);

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
              <p className="mt-2 text-center text-sm text-gray-500">{alt}</p>
            )}
          </div>
        );
      }

      // Fallback pour les images externes
      return (
        <div className="relative my-4 h-[400px] w-full">
          <Image
            src={src || "/placeholder.jpg"}
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
    <div className="flex w-full flex-1 flex-col items-center py-8 sm:py-12">
      <article className="w-full max-w-4xl rounded-[2rem] border border-public-line bg-public-paper-alt p-8 shadow-paper sm:p-10">
        <p className="text-xs uppercase tracking-[0.35em] text-public-teal">
          Article
        </p>
        <h1 className="mt-4 text-balance font-display text-4xl leading-tight text-public-ink sm:text-5xl">
          {post.title}
        </h1>
        <p className="mt-3 text-sm uppercase tracking-[0.25em] text-public-ink/45">
          {new Date(post.createdAt).toLocaleDateString("fr-FR")}
        </p>
        <div className="prose prose-lg mx-auto mt-8 max-w-none text-public-ink prose-headings:font-display prose-h2:text-public-clay prose-h3:text-public-clay prose-a:text-public-clay prose-a:underline hover:prose-a:text-public-teal">
          <ReactMarkdown components={MarkdownComponents}>
            {post.content}
          </ReactMarkdown>
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild theme="public">
            <Link href="/blog">Retour au blog</Link>
          </Button>
          <Button asChild theme="public" variant="outline">
            <Link href="/">Accueil</Link>
          </Button>
        </div>
      </article>
      <section className="mt-8 w-full max-w-4xl rounded-[2rem] border border-public-line bg-public-paper px-6 py-6 shadow-card sm:p-8">
        <h2 className="font-display text-3xl text-public-ink">Commentaires</h2>

        <div className="mt-6">
          <CommentsList postId={post.id} />
        </div>

        <div className="mt-6">
          <AddCommentForm postId={post.id} />
        </div>
      </section>
    </div>
  );
}
