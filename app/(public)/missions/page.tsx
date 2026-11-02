import type { Metadata } from "next";
import { PublicMissionsExplorer } from "@/components/PublicMissions/PublicMissionsExplorer";
import type { PublicMissionsResponse } from "@/types/PublicMissions";
import { listPublicMissions } from "@/utils/publicMissions.server";
import {
  parseMissionsPageFilters,
  toPublicMissionsQuery
} from "@/utils/publicMissionsFilters";

const TITLE = "Missions d'extras en restauration et événementiel";
const DESCRIPTION =
  "Trouvez une mission d'extra près de chez vous : serveur, chef de rang, cuisinier, barman… Consultez les missions publiées par les traiteurs et organisateurs d'événements sur Cet Extra et candidatez en ligne.";

type SearchParams = Record<string, string | string[] | undefined>;

/** Paramètres de zone : leurs variantes ne sont pas indexées. */
const ZONE_PARAMS = ["lat", "lon", "rayon", "lieu"];

/**
 * Canonical et indexation selon les filtres :
 * - sans zone : chaque page de la pagination est canonique d'elle-même
 *   (`/missions`, `/missions?page=N`) ;
 * - avec une zone : `noindex, follow` et canonical vers `/missions`.
 *
 * URL relatives : résolues par le `metadataBase` du layout racine.
 */
export async function generateMetadata(props: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const hasZone = ZONE_PARAMS.some((name) => searchParams[name] !== undefined);
  const { page } = parseMissionsPageFilters(searchParams);
  const canonical =
    !hasZone && page > 1 ? `/missions?page=${page}` : "/missions";

  return {
    title: !hasZone && page > 1 ? `${TITLE} – page ${page}` : TITLE,
    description: DESCRIPTION,
    openGraph: {
      title: `${TITLE} | Cet Extra`,
      description: DESCRIPTION,
      url: canonical,
      type: "website",
      images: [
        {
          url: "/cetextralogo.jpeg",
          width: 1200,
          height: 630,
          alt: "Cet Extra - Plateforme d'extras pour l'évènementiel"
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: `${TITLE} | Cet Extra`,
      description: DESCRIPTION,
      images: ["/cetextralogo.jpeg"]
    },
    alternates: { canonical },
    ...(hasZone && { robots: { index: false, follow: true } })
  };
}

/**
 * Vitrine publique des missions. Premier rendu serveur (indexable) calculé
 * directement par `listPublicMissions` — la même fonction que
 * `GET /api/missions/public`, sans appel HTTP vers sa propre API — puis
 * partie interactive côté client (TanStack Query).
 */
export default async function PublicMissionsPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const filters = parseMissionsPageFilters(await props.searchParams);
  const result = await listPublicMissions(toPublicMissionsQuery(filters));

  // Même forme JSON que la route API (Date → chaîne ISO)
  const initialData = JSON.parse(
    JSON.stringify(result)
  ) as PublicMissionsResponse;

  return (
    <div className="bg-white px-4 py-12 sm:px-6 md:py-16">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-4 font-black text-4xl text-employer-primary tracking-[-0.02em] md:text-5xl">
          Missions disponibles
        </h1>
        <p className="mb-10 max-w-3xl text-employer-text-secondary text-lg">
          Les missions d'extras publiées par les traiteurs et organisateurs
          d'événements. Cherchez autour d'une adresse ou de votre position, puis
          candidatez en quelques clics.
        </p>

        <PublicMissionsExplorer
          initialData={initialData}
          initialFilters={filters}
          initialDataUpdatedAt={Date.now()}
        />
      </div>
    </div>
  );
}
