/**
 * Hôte canonique unique du site : `https://cetextra.fr` (sans www).
 *
 * Surchargeable par `NEXT_PUBLIC_SITE_URL` (ex. domaine de preview), lue au
 * build côté client (préfixe NEXT_PUBLIC_) comme côté serveur. Sert au
 * `metadataBase`, au sitemap, à robots.txt, au JSON-LD des missions et aux
 * URL absolues des emails — ne jamais réécrire l'hôte en dur ailleurs.
 */
const DEFAULT_SITE_URL = "https://cetextra.fr";

/** Base absolue du site, sans slash final. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_URL
).replace(/\/+$/, "");

/** URL absolue d'un chemin du site (`/blog` → `https://cetextra.fr/blog`). */
export const absoluteUrl = (path = "/") =>
  `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
