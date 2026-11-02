import type { EnumMissionJob } from "@/store/types";

// Type de base avec les champs communs
type BaseMissionInviteBody = {
  expeditorUserId: string;
  missionJob: EnumMissionJob;
  missionStartDate: string;
  missionEndDate: string;
};

// Type avec receiverEmail
type EmailInviteBody = BaseMissionInviteBody & {
  receiverEmail: string;
  userId?: never; // Empêche d'avoir userId en même temps
};

// Type avec userId
type UserIdInviteBody = BaseMissionInviteBody & {
  receiverEmail?: never; // Empêche d'avoir receiverEmail en même temps
  userId: string;
};

// Union des deux types
export type MissionInviteBody = EmailInviteBody | UserIdInviteBody;

/**
 * Réponse 201 de POST /api/missions/[missionId]/invites. L'invitation est
 * enregistrée dans tous les cas ; `emailSent: false` signale que l'email n'a
 * pas pu être envoyé (`message` le dit en clair, à afficher).
 */
export type MissionInviteResponse = {
  message: string;
  emailSent: boolean;
};
