import { EnumMissionJob } from "@/store/types";

export type MissionInviteBody = {
  receiverEmail: string;
  expeditorUserId: string;
  missionJob: EnumMissionJob;
  missionStartDate: string;
  missionEndDate: string;
};
