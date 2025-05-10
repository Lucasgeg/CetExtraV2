import prisma from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import AddCommentForm from "@/components/ui/AddCommentForm/AddCommentForm";
import CommentsList from "@/components/ui/CommentList/CommentList";

type BlogPostPageParams = {
  id: string;
};

export async function generateStaticParams() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    select: { id: true },
    take: 10
  });

  return posts.map((post) => ({
    id: post.id
  }));
}

export async function generateMetadata(props: {
  params: Promise<BlogPostPageParams>;
}): Promise<Metadata> {
  const params = await props.params;
  const { id } = params;

  const post = await prisma.blogPost.findUnique({
    where: { id, published: true },
    select: { title: true, shortDesc: true, keywords: true }
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
      url: `https://cetextra.fr/blog/${id}`,
      siteName: "Cet Extra",
      images: [
        {
          url: "/images/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "Cet Extra Blog"
        }
      ],
      locale: "fr_FR",
      type: "article"
    }
  };
}

export default async function BlogPostPage(props: {
  params: Promise<BlogPostPageParams>;
}) {
  const params = await props.params;
  const { id } = params;
  const post = await prisma.blogPost.findUnique({
    where: { id, published: true }
  });
  if (!post) return notFound();

  const comments = await prisma.blogComment.findMany({
    where: { postId: id },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center bg-gradient-to-r from-[#22345E] via-[#FDBA3B] to-[#F15A29] py-12">
      <article className="w-full max-w-4xl rounded-2xl border-4 border-[#FDBA3B] bg-white/90 p-8 shadow-2xl">
        <h1 className="mb-2 text-center text-4xl font-extrabold text-[#22345E] md:text-5xl">
          {post.title}
        </h1>
        <p className="mb-4 text-center text-sm text-gray-600">
          {new Date(post.createdAt).toLocaleDateString("fr-FR")}
        </p>
        <div className="prose prose-lg mx-auto mb-8 max-w-none text-[#22345E] prose-h2:text-[#F15A29] prose-a:text-[#F15A29] prose-a:underline hover:prose-a:text-[#FDBA3B]">
          <ReactMarkdown>{post.content}</ReactMarkdown>
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
        {comments.length === 0 ? (
          <p className="text-gray-500">Aucun commentaire pour le moment.</p>
        ) : (
          <CommentsList postId={id} />
        )}
        <AddCommentForm postId={id} />
      </section>
    </div>
  );
}
