import type { MissionJob } from "@prisma/client";
import type { DecisionBlocker } from "@/utils/engagement.util";

/**
 * Candidature (UserMission `requested`) telle qu'exposée à l'employeur.
 * Volontairement sans email, téléphone, date de naissance ni coordonnées :
 * l'employeur n'en a pas besoin pour décider.
 */
export interface MissionApplication {
  /** UserMission.id */
  id: string;
  createdAt: string; // ISO date string
  extra: {
    firstName: string;
    lastName: string;
    profilePictureUrl: string | null;
    description: string | null;
    /** Années d'expérience déclarées sur ce poste, null si non renseignée. */
    experience: number | null;
    /** Distance domicile ↔ mission arrondie au km, null si l'un des deux n'est pas localisé. */
    distanceKm: number | null;
  };
}

export interface MissionApplicationsPosition {
  jobType: MissionJob;
  quantity: number;
  acceptedCount: number;
  /** Raison pour laquelle une candidature sur ce poste ne peut pas être acceptée, null si possible. */
  acceptBlocker: DecisionBlocker["code"] | null;
  applications: MissionApplication[];
}

/** Réponse de GET /api/missions/[missionId]/applications */
export interface GetMissionApplicationsResponse {
  hourlyRateMin: number | null;
  hourlyRateMax: number | null;
  /** Nombre total de candidatures en attente, tous postes confondus. */
  total: number;
  positions: MissionApplicationsPosition[];
}

/** Corps de PATCH /api/missions/[missionId]/applications/[applicationId] */
export type MissionApplicationDecisionBody =
  | { decision: "accept"; hourlyRate: number }
  | { decision: "refuse"; reason?: string };
