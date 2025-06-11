import prisma from "@/app/lib/prisma";

import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { RedirectToSignIn } from "@clerk/nextjs";
import { DeleteButton, PublishToggle } from "@/components/PostEditor/Actions";

const PAGE_SIZE = 10;

export default async function BlogAdminPage({
  searchParams
}: {
  searchParams: Promise<{ page: string }>;
}) {
  const { userId } = await auth();
  if (!userId) {
    return (
      <RedirectToSignIn
        signInFallbackRedirectUrl="/blog/admin"
        signInForceRedirectUrl="/blog/admin"
        redirectUrl="/blog/admin"
      />
    );
  }

  const page = (await searchParams).page || "1";
  const pageNumber = parseInt(page as string, 10);
  const skip = (pageNumber - 1) * PAGE_SIZE;

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE
    }),
    prisma.blogPost.count()
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <>
      <div className="mb-8 flex flex-col items-center justify-between sm:flex-row">
        <h1 className="text-3xl font-extrabold text-gray-800">
          Gestion du blog
        </h1>
        <Link
          href="/blog/admin/create"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white shadow transition hover:bg-blue-700 sm:mt-0"
        >
          <span>+ Nouvel article</span>
        </Link>
      </div>

      <div className="space-y-6">
        {posts.map((post) => (
          <div
            key={post.id}
            className="flex flex-col items-start justify-between rounded-xl border border-gray-200 bg-white p-5 shadow sm:flex-row sm:items-center"
          >
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {post.title}
              </h2>
              <p className="text-sm text-gray-500">
                {new Date(post.createdAt).toLocaleDateString()} –{" "}
                {post.published ? "Publié" : "Brouillon"}
              </p>
            </div>
            <div className="mt-4 flex gap-2 sm:mt-0">
              <Link
                href={`/blog/admin/${post.id}/edit`}
                className="rounded-md bg-gray-100 px-3 py-1 transition hover:bg-gray-200"
              >
                Éditer
              </Link>
              <PublishToggle post={post} />
              <DeleteButton postId={post.id} />
            </div>
          </div>
        ))}
      </div>
      {posts.length >= PAGE_SIZE && (
        <div className="mt-10 flex justify-center gap-4">
          <Link
            href={`/admin/blog?page=${pageNumber - 1}`}
            className={`rounded-full px-4 py-2 shadow ${pageNumber <= 1 ? "pointer-events-none bg-gray-200 opacity-50" : "bg-gray-100 hover:bg-gray-200"}`}
          >
            ← Précédent
          </Link>
          <span className="font-medium text-gray-700">
            Page {pageNumber} / {totalPages}
          </span>
          <Link
            href={`/admin/blog?page=${pageNumber + 1}`}
            className={`rounded-full px-4 py-2 shadow ${pageNumber >= totalPages ? "pointer-events-none bg-gray-200 opacity-50" : "bg-gray-100 hover:bg-gray-200"}`}
          >
            Suivant →
          </Link>
        </div>
      )}
    </>
  );
}
