import type { MeEngagement } from "@/types/MeEngagements";

/**
 * Répartition et libellés des engagements de l'extra (page « Mes
 * candidatures » et résumé de l'accueil) — fonctions pures, sans accès DB.
 */

export type EngagementSection =
  | "invitations"
  | "applications"
  | "upcoming"
  | "history";

/**
 * Une invitation ou une candidature reste « en cours » tant que la mission
 * n'est ni terminée (date de fin passée ou statut `completed`) ni annulée ;
 * au-delà, elle bascule dans l'historique (expirée / sans réponse).
 */
const isOver = (engagement: MeEngagement, now: Date): boolean =>
  new Date(engagement.missionEndDate) < now ||
  engagement.mission.status === "completed" ||
  engagement.mission.status === "cancelled";

export const getEngagementSection = (
  engagement: MeEngagement,
  now: Date
): EngagementSection => {
  if (engagement.status === "refused" || engagement.status === "cancelled") {
    return "history";
  }
  if (isOver(engagement, now)) return "history";

  switch (engagement.status) {
    case "pending":
      return "invitations";
    case "requested":
      return "applications";
    case "accepted":
      return "upcoming";
  }
};

export type GroupedEngagements = Record<EngagementSection, MeEngagement[]>;

/**
 * Regroupe par section. L'API trie par date de début croissante : ordre
 * conservé partout, sauf l'historique (le plus récent d'abord).
 */
export const groupEngagements = (
  engagements: MeEngagement[],
  now: Date
): GroupedEngagements => {
  const grouped: GroupedEngagements = {
    invitations: [],
    applications: [],
    upcoming: [],
    history: []
  };
  for (const engagement of engagements) {
    grouped[getEngagementSection(engagement, now)].push(engagement);
  }
  grouped.history.reverse();
  return grouped;
};

export type EngagementStatusTone = "info" | "warning" | "success" | "neutral";

/**
 * Libellé de statut compréhensible par un extra (le statut technique de la
 * UserMission seul ne suffit pas : une invitation `pending` sur une mission
 * passée est « expirée »).
 */
export const getEngagementStatusLabel = (
  engagement: MeEngagement,
  now: Date
): { label: string; tone: EngagementStatusTone } => {
  switch (engagement.status) {
    case "refused":
      return { label: "Non retenue", tone: "neutral" };
    case "cancelled":
      return { label: "Annulée", tone: "neutral" };
    case "pending":
      return isOver(engagement, now)
        ? { label: "Invitation expirée", tone: "neutral" }
        : { label: "Invitation reçue", tone: "info" };
    case "requested":
      return isOver(engagement, now)
        ? { label: "Sans réponse", tone: "neutral" }
        : { label: "En attente de réponse", tone: "warning" };
    case "accepted":
      if (engagement.mission.status === "cancelled") {
        return { label: "Mission annulée", tone: "neutral" };
      }
      return isOver(engagement, now)
        ? { label: "Terminée", tone: "neutral" }
        : { label: "Confirmée", tone: "success" };
  }
};

const PARIS_TIME_ZONE = "Europe/Paris";

const dayFormatter = new Intl.DateTimeFormat("fr-FR", {
  timeZone: PARIS_TIME_ZONE,
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric"
});

const timeFormatter = new Intl.DateTimeFormat("fr-FR", {
  timeZone: PARIS_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit"
});

const dayKeyFormatter = new Intl.DateTimeFormat("fr-CA", {
  timeZone: PARIS_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
});

/**
 * Période d'un engagement en heure de Paris, ex. « sam. 14 nov. 2026,
 * 18:00 – 23:30 » (même jour) ou « … 22:00 → dim. 15 nov. 2026, 04:00 ».
 */
export const formatEngagementPeriod = (
  startIso: string,
  endIso: string
): string => {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const startLabel = `${dayFormatter.format(start)}, ${timeFormatter.format(start)}`;

  if (dayKeyFormatter.format(start) === dayKeyFormatter.format(end)) {
    return `${startLabel} – ${timeFormatter.format(end)}`;
  }
  return `${startLabel} → ${dayFormatter.format(end)}, ${timeFormatter.format(end)}`;
};

const rateFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR"
});

export const formatHourlyRate = (rate: number): string =>
  `${rateFormatter.format(rate)} / h`;
