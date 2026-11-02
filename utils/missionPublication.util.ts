import type { UserMissionStatus } from "@prisma/client";

/**
 * Règles de publication d'une mission (diffusion publique + fourchette de taux
 * horaire indicative) — fonctions pures, sans accès DB ni import Prisma, pour
 * être partagées entre le formulaire employeur (validation client) et les
 * routes de création/édition (source de vérité).
 *
 * Voir CONTEXT.md (« Mission publique », « Fourchette de taux horaire ») et
 * docs/adr/0002.
 */

/**
 * Valide la fourchette de taux horaire indicative (€/h).
 *
 * Règles : les deux bornes ou aucune ; chaque borne est un nombre fini
 * strictement positif ; min ≤ max. Aucun minimum légal n'est appliqué (pas de
 * constante dans le repo à ce jour). `null` et `undefined` valent « absent ».
 *
 * Renvoie un message d'erreur (français, affiché tel quel côté client et
 * renvoyé par l'API) ou null si la fourchette est valide.
 */
export const validateHourlyRateRange = (
  min: unknown,
  max: unknown
): string | null => {
  const hasMin = min !== null && min !== undefined;
  const hasMax = max !== null && max !== undefined;

  if (!hasMin && !hasMax) return null;

  if (hasMin !== hasMax) {
    return "Renseignez les deux bornes du taux horaire indicatif, ou aucune.";
  }

  if (
    typeof min !== "number" ||
    typeof max !== "number" ||
    !Number.isFinite(min) ||
    !Number.isFinite(max)
  ) {
    return "Les bornes du taux horaire indicatif doivent être des nombres.";
  }

  if (min <= 0 || max <= 0) {
    return "Le taux horaire indicatif doit être supérieur à 0 €/h.";
  }

  if (min > max) {
    return "Le taux horaire minimum doit être inférieur ou égal au maximum.";
  }

  return null;
};

type PublicationFields = {
  isPublic?: boolean;
  hourlyRateMin?: number | null;
  hourlyRateMax?: number | null;
};

/**
 * Extrait et valide les champs de publication d'un body de création/édition.
 *
 * Champ absent (`undefined`) = « non fourni » : il n'apparaît pas dans `data`
 * (défaut DB à la création, valeur inchangée à l'édition). Les deux bornes
 * vont ensemble : si l'une est fournie, l'autre absente compte comme `null`
 * (donc refusée). `null` sur les deux bornes efface la fourchette.
 *
 * `isPublic: true` sans adresse n'est pas contrôlé ici : la création et
 * l'édition exigent déjà une adresse, et le prédicat de visibilité exclut de
 * toute façon une mission non localisée (ADR 0002).
 */
export const parsePublicationFields = (
  body: Record<string, unknown>
): { data: PublicationFields; error: null } | { data: null; error: string } => {
  const { isPublic, hourlyRateMin, hourlyRateMax } = body;
  const data: PublicationFields = {};

  if (isPublic !== undefined) {
    if (typeof isPublic !== "boolean") {
      return { data: null, error: "isPublic doit être un booléen." };
    }
    data.isPublic = isPublic;
  }

  if (hourlyRateMin !== undefined || hourlyRateMax !== undefined) {
    const min = hourlyRateMin ?? null;
    const max = hourlyRateMax ?? null;
    const error = validateHourlyRateRange(min, max);
    if (error) return { data: null, error };
    // Types garantis par validateHourlyRateRange (deux nombres ou deux null)
    data.hourlyRateMin = min as number | null;
    data.hourlyRateMax = max as number | null;
  }

  return { data, error: null };
};

/**
 * Statuts d'engagement qui figent le plancher : l'extra a candidaté
 * (`requested`) ou a été retenu (`accepted`) en connaissant le minimum annoncé.
 */
export const RATE_FLOOR_ENGAGEMENT_STATUSES = [
  "requested",
  "accepted"
] as const satisfies readonly UserMissionStatus[];

/**
 * Le minimum de la fourchette sert de plancher à l'acceptation d'une
 * candidature (CONTEXT.md « Fourchette de taux horaire »). Tant qu'il existe
 * des engagements actifs (`RATE_FLOOR_ENGAGEMENT_STATUSES`), il ne peut
 * qu'augmenter : baisse et retrait (qui supprime le plancher) sont refusés.
 * Sans minimum préalable, en fixer un est une hausse. Le maximum reste libre
 * (sous réserve de min ≤ max, voir `validateHourlyRateRange`).
 *
 * Renvoie un message d'erreur (409 côté API) ou null si le changement est permis.
 */
export const getRateFloorChangeBlocker = (
  oldMin: number | null,
  newMin: number | null,
  hasActiveEngagements: boolean
): string | null => {
  if (!hasActiveEngagements || oldMin === null) return null;
  if (newMin === null || newMin < oldMin) {
    return "Des candidatures sont en cours : le taux minimum ne peut qu'augmenter.";
  }
  return null;
};

const formatEuros = (rate: number) =>
  rate.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

/** « 12,00 € – 15,00 €/h », ou null sans fourchette complète. */
export const formatHourlyRateRange = (
  min: number | null | undefined,
  max: number | null | undefined
): string | null =>
  typeof min === "number" && typeof max === "number"
    ? `${formatEuros(min)} – ${formatEuros(max)}/h`
    : null;
