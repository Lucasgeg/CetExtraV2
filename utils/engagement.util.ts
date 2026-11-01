import type { MissionStatus, UserMissionStatus } from "@prisma/client";

/**
 * Règles de décision sur un engagement (UserMission) — fonctions pures, sans
 * accès DB, pour être réutilisées par toute transition vers `accepted`
 * (candidature acceptée par l'employeur aujourd'hui, invitation acceptée par
 * l'extra demain) et testables unitairement.
 *
 * Imports Prisma en `type` uniquement : le module est aussi importé côté
 * client (validation du taux dans la dialog d'acceptation).
 *
 * Voir CONTEXT.md (« Candidature », « Poste pourvu », « Taux horaire »).
 */

export type EngagementDecision = "accept" | "refuse";

/** Longueur max du motif de refus libre envoyé à l'extra (non stocké). */
export const REFUSAL_REASON_MAX_LENGTH = 500;

export type DecisionBlocker = {
  code:
    | "NOT_AWAITING_DECISION"
    | "MISSION_CLOSED"
    | "MISSION_STARTED"
    | "POSITION_FULL";
  message: string;
};

type DecisionContext = {
  decision: EngagementDecision;
  /** Statut actuel de l'engagement. */
  engagementStatus: UserMissionStatus;
  /** Statut d'attente attendu pour ce flux (`requested` pour une candidature). */
  awaitingStatus: UserMissionStatus;
  missionStatus: MissionStatus;
  missionStartDate: Date;
  /** Quantité requise pour le poste de l'engagement (0 si poste supprimé). */
  positionQuantity: number;
  /** Engagements `accepted` sur ce poste, hors engagement courant. */
  acceptedCount: number;
  now: Date;
};

/**
 * Renvoie la raison pour laquelle la décision est impossible, ou null si elle
 * est permise. Ordre des contrôles = du plus définitif au plus conjoncturel,
 * pour que le message renvoyé soit le plus utile.
 *
 * | Mission                     | Accepter | Refuser |
 * |-----------------------------|----------|---------|
 * | cancelled / completed       | non      | non     |
 * | commencée                   | non      | oui     |
 * | poste complet               | non      | oui     |
 * | isPublic = false            | oui      | oui     | (non contrôlé ici : ADR 0002)
 */
export const getDecisionBlocker = ({
  decision,
  engagementStatus,
  awaitingStatus,
  missionStatus,
  missionStartDate,
  positionQuantity,
  acceptedCount,
  now
}: DecisionContext): DecisionBlocker | null => {
  if (engagementStatus !== awaitingStatus) {
    return {
      code: "NOT_AWAITING_DECISION",
      message: `This engagement is no longer awaiting a decision (status: ${engagementStatus})`
    };
  }

  if (missionStatus === "cancelled" || missionStatus === "completed") {
    return { code: "MISSION_CLOSED", message: `Mission is ${missionStatus}` };
  }

  if (decision === "refuse") return null;

  if (
    missionStatus !== "pending" ||
    missionStartDate.getTime() <= now.getTime()
  ) {
    return { code: "MISSION_STARTED", message: "Mission has already started" };
  }

  if (acceptedCount >= positionQuantity) {
    return { code: "POSITION_FULL", message: "This position is already full" };
  }

  return null;
};

/**
 * Valide le taux horaire contractuel saisi à l'acceptation.
 *
 * Le minimum de la fourchette annoncée est un plancher (l'extra a candidaté en
 * le connaissant) ; pas de plafond : l'employeur peut payer plus. Sans
 * fourchette, tout taux strictement positif. Renvoie un message d'erreur ou
 * null si le taux est valide.
 */
export const validateAgreedHourlyRate = (
  hourlyRate: unknown,
  hourlyRateMin: number | null
): string | null => {
  if (
    typeof hourlyRate !== "number" ||
    !Number.isFinite(hourlyRate) ||
    hourlyRate <= 0
  ) {
    return "hourlyRate must be a positive number";
  }

  if (hourlyRateMin !== null && hourlyRate < hourlyRateMin) {
    return `hourlyRate must be at least the announced minimum (${hourlyRateMin})`;
  }

  return null;
};

/**
 * Seuil (€/h) au-delà duquel l'interface demande une confirmation explicite
 * avant d'envoyer une acceptation.
 *
 * Garde-fou UX contre les fautes de frappe (15 saisi 1500), PAS une règle
 * métier : la règle reste « plancher sans plafond » (voir
 * `validateAgreedHourlyRate`). Le serveur ne l'applique pas et un taux
 * supérieur reste valide une fois confirmé.
 */
export const HOURLY_RATE_WARNING_THRESHOLD = 50;

/**
 * Seuil d'avertissement effectif pour une mission : le plus grand entre
 * `HOURLY_RATE_WARNING_THRESHOLD` et le maximum annoncé de la fourchette, pour
 * ne pas demander de confirmation sur un taux que l'entreprise a elle-même
 * annoncé (ex. fourchette 60–80 €/h).
 */
export const getHourlyRateWarningThreshold = (
  hourlyRateMax: number | null
): number => Math.max(HOURLY_RATE_WARNING_THRESHOLD, hourlyRateMax ?? 0);

/** Vrai si le taux dépasse strictement le seuil d'avertissement de la mission. */
export const isUnusualHourlyRate = (
  hourlyRate: number,
  hourlyRateMax: number | null
): boolean => hourlyRate > getHourlyRateWarningThreshold(hourlyRateMax);
