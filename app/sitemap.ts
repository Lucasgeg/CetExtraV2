import type { MetadataRoute } from "next";
import prisma from "@/app/lib/prisma";
import { arePublicMissionsOpen } from "@/utils/launch";
import { listAllPublicMissions } from "@/utils/publicMissions.server";
import { absoluteUrl } from "@/utils/siteUrl";

/**
 * Sitemap natif App Router (`/sitemap.xml`), remplace next-sitemap qui ne
 * voyait pas les routes issues de la base.
 *
 * Mis en cache et régénéré au plus toutes les heures (ISR) : les robots sont
 * servis depuis le cache, sans requête base à chaque lecture. Chaque source
 * dynamique est isolée dans un try/catch : base injoignable (build compris)
 * → on publie au moins les pages statiques plutôt que de casser le build ou
 * de répondre 500, et la version dégradée ne vit qu'une heure.
 */
export const revalidate = 3600;

const staticEntries = (): MetadataRoute.Sitemap => [
  { url: absoluteUrl("/") },
  { url: absoluteUrl("/about") },
  { url: absoluteUrl("/blog") }
];

/** Articles publiés, comme le listing `app/(public)/blog/page.tsx`. */
const blogEntries = async (): Promise<MetadataRoute.Sitemap> => {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      select: { shortUrl: true, updatedAt: true },
      orderBy: { createdAt: "desc" }
    });
    return posts.map((post) => ({
      url: absoluteUrl(`/blog/${post.shortUrl}`),
      lastModified: post.updatedAt
    }));
  } catch (error) {
    console.error("Sitemap : articles de blog indisponibles", error);
    return [];
  }
};

/**
 * Vitrine `/missions` et fiches des missions visibles (prédicat public
 * complet, docs/adr/0002). Seulement la page 1 du listing : ni `?page=` ni
 * variantes filtrées. Rien tant que la vitrine est fermée par le middleware
 * (pré-lancement en prod, voir utils/launch.ts).
 */
const missionEntries = async (): Promise<MetadataRoute.Sitemap> => {
  if (!arePublicMissionsOpen) {
    return [];
  }

  const listing = { url: absoluteUrl("/missions") };
  try {
    const missions = await listAllPublicMissions();
    return [
      listing,
      ...missions.map((mission) => ({
        url: absoluteUrl(`/missions/${mission.id}`)
      }))
    ];
  } catch (error) {
    console.error("Sitemap : missions publiques indisponibles", error);
    return [listing];
  }
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [blog, missions] = await Promise.all([blogEntries(), missionEntries()]);
  return [...staticEntries(), ...missions, ...blog];
}
