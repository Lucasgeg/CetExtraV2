import type { MissionStatus, UserMissionStatus } from "@prisma/client";
import type { EnumMissionJob } from "@/store/types";

/**
 * Contrat de `GET /api/me/engagements` : engagements (UserMission) de l'extra
 * connecté, quel que soit leur statut (invitation reçue, candidature envoyée,
 * mission confirmée, refus, annulation).
 */

/** Valeurs acceptées par le paramètre `scope` (sur la date de fin). */
export const ENGAGEMENT_SCOPES = ["upcoming", "past", "all"] as const;

export type EngagementScope = (typeof ENGAGEMENT_SCOPES)[number];

type MeEngagementBase = {
  /** UserMission.id */
  id: string;
  /** Libellé front du poste (`convertToFrontendMissionJob`). */
  missionJob: EnumMissionJob;
  /** Dates de l'engagement (ISO 8601, UTC). */
  missionStartDate: string;
  missionEndDate: string;
  mission: {
    id: string;
    name: string;
    status: MissionStatus;
    companyName: string;
  };
};

/** Mission confirmée : taux contractuel et adresse complète. */
export type MeEngagementAccepted = MeEngagementBase & {
  status: "accepted";
  /** Taux horaire contractuel ; null s'il n'est pas (encore) renseigné. */
  hourlyRate: number | null;
  /** `missionLocation.fullName`, null si la mission n'est pas localisée. */
  location: string | null;
};

/**
 * Tout autre statut : jamais de taux horaire. Lieu :
 * - `pending` (invitation de l'employeur à cet extra) : adresse complète,
 *   même sur une mission privée — l'extra en a besoin pour décider ;
 * - autres statuts : uniquement si la mission est actuellement visible
 *   publiquement (prédicat complet de `utils/missionVisibility.util.ts`),
 *   soit exactement ce que le détail public expose déjà ; sinon null.
 */
export type MeEngagementNotAccepted = MeEngagementBase & {
  status: Exclude<UserMissionStatus, "accepted">;
  location: string | null;
};

export type MeEngagement = MeEngagementAccepted | MeEngagementNotAccepted;

export type MeEngagementsResponse = {
  /** Triés par date de début croissante. */
  engagements: MeEngagement[];
};
