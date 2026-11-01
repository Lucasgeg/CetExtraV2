import type { UserMissionStatus } from "@prisma/client";
import {
  CONTACT_VISIBLE_USER_MISSION_STATUSES,
  type ContactVisibleUserMissionStatus
} from "@/types/api";

/**
 * Indique si l'entreprise peut voir les coordonnées (email, téléphone,
 * identifiant utilisateur) de l'extra inscrit lié à une UserMission de ce
 * statut. Liste blanche (`CONTACT_VISIBLE_USER_MISSION_STATUSES`) : un statut
 * non listé, y compris un statut ajouté plus tard, est masqué par défaut.
 */
export const isContactVisibleStatus = (
  status: UserMissionStatus
): status is ContactVisibleUserMissionStatus =>
  (
    CONTACT_VISIBLE_USER_MISSION_STATUSES as readonly UserMissionStatus[]
  ).includes(status);
