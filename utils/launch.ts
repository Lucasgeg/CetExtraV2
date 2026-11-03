/**
 * Ouverture progressive du site avant le lancement.
 *
 * Lu par le middleware (routes publiques) et par `app/sitemap.ts` : une
 * route fermée par le middleware ne doit jamais être annoncée aux moteurs.
 * Sans dépendance serveur (Prisma…) : importable depuis le middleware.
 */

/** Déploiement de production Vercel (preview et dev local exclus). */
export const isProductionDeployment = process.env.VERCEL_ENV === "production";

/**
 * Vitrine publique `/missions` (listing et fiches) ouverte sans connexion.
 * Pré-lancement : dev/preview uniquement. Au lancement, passer à `true` —
 * le middleware l'ouvre et le sitemap l'annonce en même temps.
 */
export const arePublicMissionsOpen = !isProductionDeployment;
