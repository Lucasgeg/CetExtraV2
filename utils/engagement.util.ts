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

/**
 * Annulation d'une mission par l'employeur — règles pures, réutilisables par
 * les futures transitions de statut (mission et engagements).
 *
 * | Mission (avant)       | Annulable |
 * |-----------------------|-----------|
 * | pending / active      | oui       |
 * | cancelled / completed | non (409) |
 *
 * | Engagement (avant) | Après annulation de la mission | Email |
 * |--------------------|--------------------------------|-------|
 * | pending            | cancelled                      | non   |
 * | requested          | cancelled                      | oui   |
 * | accepted           | cancelled                      | oui   |
 * | refused            | inchangé (historique)          | non   |
 * | cancelled          | inchangé                       | non   |
 *
 * Les `Invitation` (extras non inscrits) en attente (`pending`) sont annulées
 * sans email.
 */

/** Longueur max du message d'annulation libre envoyé aux extras (non stocké). */
export const MISSION_CANCELLATION_MESSAGE_MAX_LENGTH = 500;

/** Statuts de mission depuis lesquels l'employeur peut annuler la mission. */
export const CANCELLABLE_MISSION_STATUSES = [
  "pending",
  "active"
] as const satisfies readonly MissionStatus[];

/** Vrai si une mission dans ce statut peut être annulée. */
export const isMissionCancellable = (status: MissionStatus): boolean =>
  (CANCELLABLE_MISSION_STATUSES as readonly MissionStatus[]).includes(status);

/**
 * Statuts d'engagement (UserMission) passés à `cancelled` par l'annulation de
 * la mission. `refused` et `cancelled` sont conservés pour l'historique.
 */
export const ENGAGEMENT_STATUSES_CANCELLED_WITH_MISSION = [
  "pending",
  "requested",
  "accepted"
] as const satisfies readonly UserMissionStatus[];

/**
 * Vrai si un engagement dans ce statut est annulé avec sa mission.
 * Sans appelant pour l'instant : conservé pour le ticket sur les transitions
 * de statut (la route d'annulation filtre en SQL sur la constante ci-dessus).
 */
export const isEngagementCancelledWithMission = (
  status: UserMissionStatus
): boolean =>
  (
    ENGAGEMENT_STATUSES_CANCELLED_WITH_MISSION as readonly UserMissionStatus[]
  ).includes(status);

/**
 * Statuts d'engagement dont l'extra est prévenu par email de l'annulation de
 * la mission : il s'est engagé (`accepted`) ou a candidaté (`requested`). Les
 * invitations `pending` sans réponse sont annulées en silence.
 */
export const ENGAGEMENT_STATUSES_NOTIFIED_ON_MISSION_CANCELLATION = [
  "requested",
  "accepted"
] as const satisfies readonly UserMissionStatus[];

/** Statut d'attente des `Invitation` (extras non inscrits) annulées avec la mission. */
export const INVITATION_STATUSES_CANCELLED_WITH_MISSION = [
  "pending"
] as const satisfies readonly UserMissionStatus[];

/**
 * Invitation d'un extra par l'employeur (POST /api/missions/[id]/invites) —
 * transition depuis un engagement (UserMission) éventuellement existant pour
 * le couple (extra, mission). S'applique aussi aux `Invitation` (extras non
 * inscrits, invités par email), qui ne connaissent en pratique que `pending`
 * et `cancelled`.
 *
 * | Engagement existant | Invitation                                             |
 * |---------------------|--------------------------------------------------------|
 * | aucun               | création en `pending`, taux null                       |
 * | cancelled / refused | réinvitation : `pending`, taux null, dates/poste MAJ   |
 * | pending             | non (409) : déjà invité                                |
 * | requested           | non (409) : accepter la candidature à la place         |
 * | accepted            | non (409) : déjà dans l'équipe (statut et taux gardés) |
 */

export type InviteBlocker = {
  code: "ALREADY_INVITED" | "ALREADY_APPLIED" | "ALREADY_IN_TEAM";
  message: string;
};

/** Statuts d'engagement depuis lesquels l'employeur peut réinviter l'extra. */
export const REINVITABLE_ENGAGEMENT_STATUSES = [
  "cancelled",
  "refused"
] as const satisfies readonly UserMissionStatus[];

// Record exhaustif : un futur statut ne compile pas tant qu'il n'est pas classé
const INVITE_BLOCKERS: Record<UserMissionStatus, InviteBlocker | null> = {
  cancelled: null,
  refused: null,
  pending: {
    code: "ALREADY_INVITED",
    message: "Cet extra est déjà invité sur cette mission"
  },
  requested: {
    code: "ALREADY_APPLIED",
    message:
      "Cet extra a déjà candidaté : acceptez sa candidature depuis la section Candidatures"
  },
  accepted: {
    code: "ALREADY_IN_TEAM",
    message: "Cet extra fait déjà partie de l'équipe"
  }
};

/**
 * Renvoie la raison pour laquelle l'employeur ne peut pas (ré)inviter l'extra,
 * ou null si l'invitation est permise. `existingStatus` vaut null quand aucun
 * engagement n'existe encore pour ce couple (extra, mission).
 */
export const getInviteBlocker = (
  existingStatus: UserMissionStatus | null
): InviteBlocker | null =>
  existingStatus === null ? null : INVITE_BLOCKERS[existingStatus];

/**
 * Retrait d'un extra de l'équipe par l'employeur
 * (PATCH /api/missions/[id]/users/[userId]) : seul un membre de l'équipe
 * (`accepted`) peut être retiré (→ `cancelled`, email à l'extra). Une
 * invitation `pending` s'annule via les routes d'invitation, une candidature
 * `requested` se refuse via la décision sur candidature ; `refused` et
 * `cancelled` sont terminaux.
 */
export const COMPANY_REMOVABLE_ENGAGEMENT_STATUSES = [
  "accepted"
] as const satisfies readonly UserMissionStatus[];

/** Vrai si l'employeur peut retirer de l'équipe un engagement dans ce statut. */
export const canCompanyRemoveEngagement = (
  status: UserMissionStatus
): boolean =>
  (
    COMPANY_REMOVABLE_ENGAGEMENT_STATUSES as readonly UserMissionStatus[]
  ).includes(status);

/**
 * Conditions sur la mission elle-même pour inviter un extra ou retirer un
 * membre de l'équipe (contrôlées après l'appartenance, avant le statut de
 * l'engagement).
 *
 * | Mission                     | Inviter   | Retirer   |
 * |-----------------------------|-----------|-----------|
 * | cancelled                   | non (409) | non (409) |
 * | completed                   | non (409) | non (409) |
 * | pending / active, commencée | non (409) | oui       |
 * | pending / active, à venir   | oui       | oui       |
 *
 * Le retrait reste possible sur une mission commencée : un extra peut se
 * désister le jour même. « Ouverte » = annulable (`isMissionCancellable`).
 */

export type MissionBlocker = {
  code: "MISSION_CANCELLED" | "MISSION_COMPLETED" | "MISSION_STARTED";
  message: string;
};

/** Vrai si la mission a commencé (début atteint ou dépassé). */
export const hasMissionStarted = (missionStartDate: Date, now: Date): boolean =>
  missionStartDate.getTime() <= now.getTime();

/** Mission close (annulée ou terminée) : aucune transition d'engagement. */
const getClosedMissionBlocker = (
  missionStatus: MissionStatus
): MissionBlocker | null => {
  if (isMissionCancellable(missionStatus)) return null;
  return missionStatus === "cancelled"
    ? { code: "MISSION_CANCELLED", message: "Mission annulée" }
    : { code: "MISSION_COMPLETED", message: "Mission terminée" };
};

/**
 * Raison pour laquelle l'employeur ne peut pas inviter d'extra sur cette
 * mission (UserMission comme `Invitation`), ou null : mission `pending` /
 * `active` et pas encore commencée.
 */
export const getMissionInviteBlocker = ({
  missionStatus,
  missionStartDate,
  now
}: {
  missionStatus: MissionStatus;
  missionStartDate: Date;
  now: Date;
}): MissionBlocker | null =>
  getClosedMissionBlocker(missionStatus) ??
  (hasMissionStarted(missionStartDate, now)
    ? { code: "MISSION_STARTED", message: "Mission déjà commencée" }
    : null);

/**
 * Raison pour laquelle l'employeur ne peut pas retirer un membre de l'équipe
 * de cette mission, ou null : seule une mission annulée ou terminée l'empêche.
 */
export const getMissionRemovalBlocker = (
  missionStatus: MissionStatus
): MissionBlocker | null => getClosedMissionBlocker(missionStatus);
