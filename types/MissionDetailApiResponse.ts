import type {
  MissionJob,
  MissionStatus,
  UserMissionStatus
} from "@prisma/client";
import type { ContactVisibleUserMissionStatus } from "@/types/api";

export interface MissionDetailApiResponse {
  // Champs de base de la mission
  id: string;
  name: string;
  description: string | null;
  additionalInfo: string | null;
  missionStartDate: string; // ISO format date string
  missionEndDate: string; // ISO format date string
  creatorId: string;
  missionLocationId: string | null;
  status: MissionStatus;

  missionLocation: {
    id: string;
    lat: number;
    lon: number;
    fullName: string;
  } | null;

  requiredPositions: Array<{
    id: string;
    jobType: MissionJob;
    quantity: number;
  }>;

  /** Employés `accepted` et `pending`. Discriminé par `status`. */
  employees: MissionDetailEmployee[];
  invitations?: Array<{
    id: string;
  }>;
}

type MissionDetailEmployeeBase = {
  /** UserMission.id */
  id: string;
  missionJob: MissionJob;
  startDate: string; // ISO format date string
  duration: number; // in hours
  hourlyRate: number | null; // null = taux pas encore convenu
};

/** Membre de l'équipe (`accepted`) : coordonnées et identifiant utilisateur. */
export type MissionDetailEmployeeWithContact = MissionDetailEmployeeBase & {
  status: ContactVisibleUserMissionStatus;
  user: {
    id: string;
    email: string;
    extra: {
      firstName: string;
      lastName: string;
    };
  };
};

/**
 * Invitation en attente (`pending`) ou tout autre statut : prénom et nom
 * seulement, ni email ni identifiant utilisateur (RGPD, cf.
 * `CONTACT_VISIBLE_USER_MISSION_STATUSES`).
 */
export type MissionDetailEmployeeMasked = MissionDetailEmployeeBase & {
  status: Exclude<UserMissionStatus, ContactVisibleUserMissionStatus>;
  user: {
    extra: {
      firstName: string;
      lastName: string;
    };
  };
};

export type MissionDetailEmployee =
  | MissionDetailEmployeeWithContact
  | MissionDetailEmployeeMasked;
