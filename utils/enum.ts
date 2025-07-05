import { EnumMissionJob } from "@/store/types";

export const getJobLabel = (jobEnum: EnumMissionJob): string => {
  if (Object.values(EnumMissionJob).includes(jobEnum)) {
    return jobEnum;
  }

  return (
    EnumMissionJob[jobEnum as unknown as keyof typeof EnumMissionJob] || jobEnum
  );
};

export const getMissionJobKey = (
  jobValue: string
): keyof typeof EnumMissionJob => {
  const entries = Object.entries(EnumMissionJob) as [
    keyof typeof EnumMissionJob,
    string
  ][];
  const found = entries.find(([_, value]) => value === jobValue);
  if (!found) {
    throw new Error(`Invalid job value: ${jobValue}`);
  }
  return found[0];
};
