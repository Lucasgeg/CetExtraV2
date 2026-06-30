import type { EnumMissionJob } from "@/store/types";

export type MissionRemoveUserBody = {
  message?: string;
  missionJob: EnumMissionJob;
};
