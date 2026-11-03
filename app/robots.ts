import type { MetadataRoute } from "next";
import { absoluteUrl, SITE_URL } from "@/utils/siteUrl";

/**
 * `/robots.txt` natif App Router (remplace celui généré par next-sitemap).
 * Public sans connexion : `/robots.txt` figure dans les routes publiques du
 * middleware, en prod comme en dev.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/private/",
        // Espaces connectés
        "/company",
        "/extra",
        "/sign-in",
        "/blog/admin"
      ]
    },
    host: SITE_URL,
    sitemap: absoluteUrl("/sitemap.xml")
  };
}
