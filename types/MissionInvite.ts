import { EnumMissionJob } from "@/store/types";

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
