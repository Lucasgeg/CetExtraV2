import type { PublicMissionsFilters } from "@/utils/queryKeys";

/**
 * Filtres de la vitrine `/missions`, reflétés dans l'URL (partageable et
 * rechargeable). Partagé entre la page serveur (premier rendu) et le
 * composant client (TanStack Query) pour qu'ils lisent l'URL de la même façon.
 *
 * Paramètres d'URL : `lat`, `lon`, `lieu` (libellé affiché), `rayon` (km),
 * `page` (1-based). Contrairement à l'API (400), une URL invalide est
 * tolérée : zone ignorée, rayon et page par défaut.
 */

export const RADIUS_OPTIONS_KM = [10, 25, 50] as const;
export type RadiusOptionKm = (typeof RADIUS_OPTIONS_KM)[number];

/** Aligné sur le défaut de l'API publique (50 km). */
export const DEFAULT_RADIUS_KM: RadiusOptionKm = 50;
export const PUBLIC_MISSIONS_PAGE_SIZE = 10;

export type MissionsPageFilters = {
  zone: { lat: number; lon: number; label: string | null } | null;
  radius: RadiusOptionKm;
  page: number;
};

type SearchParamsLike =
  | URLSearchParams
  | { get: (name: string) => string | null }
  | Record<string, string | string[] | undefined>;

const readParam = (params: SearchParamsLike, name: string): string | null => {
  if (typeof (params as URLSearchParams).get === "function") {
    return (params as URLSearchParams).get(name);
  }
  const value = (params as Record<string, string | string[] | undefined>)[name];
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
};

const isRadiusOption = (value: number): value is RadiusOptionKm =>
  (RADIUS_OPTIONS_KM as readonly number[]).includes(value);

export const parseMissionsPageFilters = (
  params: SearchParamsLike
): MissionsPageFilters => {
  const lat = Number.parseFloat(readParam(params, "lat") ?? "");
  const lon = Number.parseFloat(readParam(params, "lon") ?? "");
  const zone =
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lon) <= 180
      ? { lat, lon, label: readParam(params, "lieu")?.slice(0, 200) || null }
      : null;

  const radiusParam = Number.parseInt(readParam(params, "rayon") ?? "", 10);
  const radius = isRadiusOption(radiusParam) ? radiusParam : DEFAULT_RADIUS_KM;

  const pageParam = Number.parseInt(readParam(params, "page") ?? "", 10);
  const page = Number.isFinite(pageParam) && pageParam > 1 ? pageParam : 1;

  return { zone, radius, page };
};

/** Query string de la page `/missions` (paramètres par défaut omis). */
export const toMissionsPageSearchParams = ({
  zone,
  radius,
  page
}: MissionsPageFilters): URLSearchParams => {
  const params = new URLSearchParams();
  if (zone) {
    params.set("lat", String(zone.lat));
    params.set("lon", String(zone.lon));
    if (zone.label) params.set("lieu", zone.label);
  }
  if (radius !== DEFAULT_RADIUS_KM) params.set("rayon", String(radius));
  if (page > 1) params.set("page", String(page));
  return params;
};

export const missionsPageHref = (filters: MissionsPageFilters) => {
  const query = toMissionsPageSearchParams(filters).toString();
  return query ? `/missions?${query}` : "/missions";
};

/** Pagination et zone au format de l'API / de `listPublicMissions`. */
export const toPublicMissionsQuery = ({
  zone,
  radius,
  page
}: MissionsPageFilters) => ({
  center: zone ? { lat: zone.lat, lon: zone.lon } : null,
  radius,
  take: PUBLIC_MISSIONS_PAGE_SIZE,
  skip: (page - 1) * PUBLIC_MISSIONS_PAGE_SIZE
});

/** Query string de `GET /api/missions/public`. */
export const toPublicMissionsApiSearchParams = (
  filters: MissionsPageFilters
): URLSearchParams => {
  const { center, radius, take, skip } = toPublicMissionsQuery(filters);
  const params = new URLSearchParams({
    take: String(take),
    skip: String(skip)
  });
  if (center) {
    params.set("lat", String(center.lat));
    params.set("lon", String(center.lon));
    params.set("radius", String(radius));
  }
  return params;
};

/** Clé de cache : le libellé et le rayon sans zone n'influent pas sur le résultat. */
export const toPublicMissionsKeyFilters = ({
  zone,
  radius,
  page
}: MissionsPageFilters): PublicMissionsFilters => ({
  lat: zone?.lat ?? null,
  lon: zone?.lon ?? null,
  radius: zone ? radius : null,
  page
});

/**
 * Arrondi des coordonnées issues de la géolocalisation (~1 km) avant de les
 * mettre dans l'URL : l'URL est faite pour être partagée, elle ne doit pas
 * divulguer la position exacte du visiteur.
 */
export const roundCoordinate = (value: number) => Math.round(value * 100) / 100;
