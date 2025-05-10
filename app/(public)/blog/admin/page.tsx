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
    <div className="mx-auto w-full max-w-4xl p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestion du blog</h1>
        <Link
          href="/blog/admin/create"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Nouvel article
        </Link>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="flex w-full items-center justify-between rounded-lg border p-4"
          >
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">{post.title}</h2>
              <p className="text-sm text-gray-500">
                {new Date(post.createdAt).toLocaleDateString()} -{" "}
                {post.published ? "Publié" : "Brouillon"}
              </p>
            </div>

            <div className="flex gap-2">
              <Link
                href={`/blog/admin/${post.id}/edit`}
                className="rounded-md bg-gray-100 px-3 py-1 hover:bg-gray-200"
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
        <div className="mt-8 flex justify-between">
          <Link
            href={`/admin/blog?page=${pageNumber - 1}`}
            className={`rounded px-4 py-2 ${pageNumber <= 1 ? "pointer-events-none bg-gray-200 opacity-50" : "bg-gray-100 hover:bg-gray-200"}`}
          >
            Précédent
          </Link>
          <span>
            Page {page} / {totalPages}
          </span>
          <Link
            href={`/admin/blog?page=${pageNumber + 1}`}
            className={`rounded px-4 py-2 ${pageNumber >= totalPages ? "pointer-events-none bg-gray-200 opacity-50" : "bg-gray-100 hover:bg-gray-200"}`}
          >
            Suivant
          </Link>
        </div>
      )}
    </div>
  );
}
