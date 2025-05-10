import prisma from "@/app/lib/prisma";
import Link from "next/link";

export const revalidate = 60;

export const dynamicParams = true;

// export async function generateStaticParams() {
//   const posts = await prisma.blogPost.findMany({
//     where: { published: true },
//     select: { id: true },
//     take: 10
//   });

//   return posts.map((post) => ({
//     id: post.id
//   }));
// }

// export const metadata = {
//   title: "Blog | Cet Extra",
//   description:
//     "Suivez l'évolution du projet, nos annonces et nos nouveautés sur le blog de Cet Extra.",
//   openGraph: {
//     title: "Blog | Cet Extra",
//     description:
//       "Suivez l'évolution du projet, nos annonces et nos nouveautés sur le blog de Cet Extra.",
//     url: "https://cetextra.fr/blog",
//     siteName: "Cet Extra",
//     images: [
//       {
//         url: "/images/og-image.jpg",
//         width: 1200,
//         height: 630,
//         alt: "Cet Extra Blog"
//       }
//     ],
//     locale: "fr_FR",
//     type: "website"
//   }
// };

export default async function BlogListPage() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      shortDesc: true,
      createdAt: true
    }
  });

  return (
    <div className="flex w-full flex-1 flex-col items-center overflow-y-auto bg-gradient-to-r from-[#22345E] via-[#FDBA3B] to-[#F15A29] py-12">
      <section className="w-full max-w-2xl rounded-2xl border-4 border-[#FDBA3B] bg-white/90 p-8 shadow-2xl">
        <h1 className="mb-8 text-center text-4xl font-extrabold text-[#22345E] md:text-5xl">
          Le Blog
        </h1>

        <ul className="space-y-8 text-[#22345E]">
          {posts.map((post) => (
            <li
              key={post.id}
              className="rounded-lg border border-[#FDBA3B] bg-white p-6 shadow-md transition hover:border-[#F15A29] hover:shadow-lg"
            >
              <h2 className="mb-2 text-2xl font-semibold text-[#F15A29]">
                <Link href={`/blog/${post.id}`} className="hover:underline">
                  {post.title}
                </Link>
              </h2>
              <p className="mb-2 text-sm text-gray-600">
                {new Date(post.createdAt).toLocaleDateString("fr-FR")}
              </p>
              <p className="mb-4">{post.shortDesc}</p>
              <Link
                href={`/blog/${post.id}`}
                className="font-medium text-[#F15A29] underline hover:text-[#FDBA3B]"
              >
                Lire l'article →
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
