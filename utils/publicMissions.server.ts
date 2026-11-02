import prisma from "@/app/lib/prisma";
import { calculateDistance } from "@/utils/distance.utils";
import {
  getOpenPositions,
  publicMissionSelect,
  publicMissionVisibilityWhere
} from "@/utils/missionVisibility.util";

/**
 * Logique serveur des surfaces publiques de missions, partagée par les routes
 * `GET /api/missions/public(/[missionId])` (consommées aussi par l'app
 * mobile) et les pages `/missions` (rendu serveur, sans appel HTTP vers sa
 * propre API). Le contrat JSON des routes est celui de ces fonctions passé
 * par `NextResponse.json` (Date → chaîne ISO).
 *
 * Ne s'importe que côté serveur (Prisma).
 */

export const PUBLIC_MISSIONS_DEFAULT_RADIUS_KM = 50;
const MIN_RADIUS_KM = 1;
const MAX_RADIUS_KM = 200;
export const PUBLIC_MISSIONS_DEFAULT_TAKE = 10;
const MAX_TAKE = 50;

export type PublicMissionsQuery = {
  /** Centre de la zone ; null = pas de filtre de distance. */
  center: { lat: number; lon: number } | null;
  /** km, ignoré sans `center`. */
  radius: number;
  take: number;
  skip: number;
};

export type ParsePublicMissionsQueryResult =
  | { ok: true; query: PublicMissionsQuery }
  | { ok: false; message: string };

/**
 * Valide et normalise les paramètres publics du listing.
 *
 * - `lat`/`lon` : optionnels, les deux ou aucun (erreur sinon) ;
 * - `radius` : km, seulement avec lat/lon ; défaut 50, borné à [1, 200] ;
 * - `take`/`skip` : pagination ; take défaut 10, borné à [1, 50].
 *
 * Les messages d'erreur font partie du contrat (400) de la route API.
 */
export const parsePublicMissionsQuery = (
  searchParams: URLSearchParams
): ParsePublicMissionsQueryResult => {
  const latParam = searchParams.get("lat");
  const lonParam = searchParams.get("lon");

  if ((latParam === null) !== (lonParam === null)) {
    return { ok: false, message: "lat and lon must be provided together" };
  }

  let center: PublicMissionsQuery["center"] = null;
  if (latParam !== null && lonParam !== null) {
    const lat = Number.parseFloat(latParam);
    const lon = Number.parseFloat(lonParam);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lon) ||
      Math.abs(lat) > 90 ||
      Math.abs(lon) > 180
    ) {
      return { ok: false, message: "Invalid lat/lon parameters" };
    }
    center = { lat, lon };
  }

  let radius = PUBLIC_MISSIONS_DEFAULT_RADIUS_KM;
  const radiusParam = searchParams.get("radius");
  if (radiusParam !== null) {
    const parsedRadius = Number.parseFloat(radiusParam);
    if (!Number.isFinite(parsedRadius)) {
      return { ok: false, message: "Invalid radius parameter" };
    }
    radius = Math.min(Math.max(parsedRadius, MIN_RADIUS_KM), MAX_RADIUS_KM);
  }

  // Inputs publics : bornés
  const takeParam = Number.parseInt(searchParams.get("take") ?? "", 10);
  const take = Number.isFinite(takeParam)
    ? Math.min(Math.max(takeParam, 1), MAX_TAKE)
    : PUBLIC_MISSIONS_DEFAULT_TAKE;

  const skipParam = Number.parseInt(searchParams.get("skip") ?? "", 10);
  const skip = Number.isFinite(skipParam) ? Math.max(skipParam, 0) : 0;

  return { ok: true, query: { center, radius, take, skip } };
};

/**
 * Listing public paginé des missions visibles.
 *
 * Prédicat de visibilité (voir docs/adr/0002 + CONTEXT.md « Mission
 * visible ») : isPublic, statut pending, localisation renseignée, pas encore
 * commencée, au moins un poste non pourvu (engagements `accepted` seulement).
 *
 * Deux parties du prédicat ne sont pas exprimables en `where` Prisma
 * (agrégat par poste, distance Haversine) : elles sont filtrées en mémoire
 * AVANT la pagination — ne jamais paginer en SQL puis filtrer en mémoire
 * (tailles de page et totaux faux). Charger toutes les missions publiques
 * vivantes par requête est délibéré au volume MVP ; à revoir en SQL brut si
 * le volume grandit.
 *
 * Tri : distance croissante avec un centre, sinon date de début croissante.
 */
export async function listPublicMissions({
  center,
  radius,
  take,
  skip
}: PublicMissionsQuery) {
  // 1. Partie SQL-exprimable du prédicat de visibilité
  const missions = await prisma.mission.findMany({
    where: publicMissionVisibilityWhere(),
    select: publicMissionSelect,
    orderBy: { missionStartDate: "asc" }
  });

  // 2. Reste du prédicat : postes non pourvus + distance
  const visibleMissions = missions.flatMap((mission) => {
    const { employees, requiredPositions, missionLocation, ...rest } = mission;

    // Garanti non null par le where, mais le type Prisma reste nullable
    if (!missionLocation) {
      return [];
    }

    const openPositions = getOpenPositions(requiredPositions, employees);

    if (openPositions.length === 0) {
      return [];
    }

    const distance = center
      ? calculateDistance(
          center.lat,
          center.lon,
          missionLocation.lat,
          missionLocation.lon
        )
      : null;

    if (distance !== null && distance > radius) {
      return [];
    }

    return [
      {
        ...rest,
        missionLocation,
        requiredPositions: openPositions,
        distance: distance === null ? null : Math.round(distance * 10) / 10
      }
    ];
  });

  // 3. Tri puis pagination en mémoire (après filtrage, jamais avant)
  if (center) {
    visibleMissions.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
  }

  const total = visibleMissions.length;
  const pageMissions = visibleMissions.slice(skip, skip + take);

  return {
    missions: pageMissions,
    total,
    metadata: {
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
      totalPages: Math.ceil(total / take),
      hasMore: skip + take < total
    }
  };
}

/**
 * Détail public d'une mission, ou `null` si elle n'est pas visible
 * publiquement (inconnue, opt-out, annulée, commencée ou complète) : les
 * appelants renvoient le même 404 opaque dans tous ces cas — ne jamais
 * révéler qu'une mission cachée existe.
 *
 * `requiredPositions` ne contient que les postes encore ouverts.
 */
export async function getPublicMission(missionId: string) {
  const mission = await prisma.mission.findFirst({
    where: { id: missionId, ...publicMissionVisibilityWhere() },
    select: publicMissionSelect
  });

  if (!mission) {
    return null;
  }

  const openPositions = getOpenPositions(
    mission.requiredPositions,
    mission.employees
  );

  if (openPositions.length === 0) {
    return null;
  }

  const {
    employees: _employees,
    requiredPositions: _required,
    ...rest
  } = mission;

  return { ...rest, requiredPositions: openPositions };
}

export type PublicMissionsPage = Awaited<ReturnType<typeof listPublicMissions>>;
export type PublicMissionDetail = NonNullable<
  Awaited<ReturnType<typeof getPublicMission>>
>;
