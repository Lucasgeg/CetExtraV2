import { EnumMissionJob } from "@/store/types";

export type MissionRemoveUserBody = {
  message?: string;
  missionJob: EnumMissionJob;
};
