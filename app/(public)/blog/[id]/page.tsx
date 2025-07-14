import prisma from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import AddCommentForm from "@/components/ui/AddCommentForm/AddCommentForm";
import CommentsList from "@/components/ui/CommentList/CommentList";
import type { Components } from "react-markdown";
import Image from "next/image";

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
    <div className="flex w-full flex-1 flex-col items-center justify-center bg-gradient-to-r from-[#22345E] via-[#FDBA3B] to-[#F15A29] px-6 py-12">
      <article className="w-full max-w-4xl rounded-2xl border-4 border-[#FDBA3B] bg-white/90 p-8 shadow-2xl">
        <h1 className="mb-2 text-center text-4xl font-extrabold text-[#22345E] md:text-5xl">
          {post.title}
        </h1>
        <p className="mb-4 text-center text-sm text-gray-600">
          {new Date(post.createdAt).toLocaleDateString("fr-FR")}
        </p>
        <div className="prose prose-lg mx-auto mb-8 max-w-none text-[#22345E] prose-h2:text-[#F15A29] prose-a:text-[#F15A29] prose-a:underline hover:prose-a:text-[#FDBA3B]">
          <ReactMarkdown components={MarkdownComponents}>
            {post.content}
          </ReactMarkdown>
        </div>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/blog"
            className="inline-block rounded-lg bg-[#FDBA3B] px-6 py-3 font-semibold text-[#22345E] shadow transition hover:bg-[#F15A29] hover:text-white"
          >
            Retour au blog
          </Link>
          <Link
            href="/"
            className="inline-block rounded-lg bg-[#FDBA3B] px-6 py-3 font-semibold text-[#22345E] shadow transition hover:bg-[#F15A29] hover:text-white"
          >
            Accueil
          </Link>
        </div>
      </article>
      <section className="mt-8 w-full max-w-4xl rounded-2xl border-2 border-[#22345E] bg-white/90 p-6 shadow-lg">
        <h2 className="mb-4 text-2xl font-bold text-[#22345E]">Commentaires</h2>

        <CommentsList postId={post.id} />

        <AddCommentForm postId={post.id} />
      </section>
    </div>
  );
}
