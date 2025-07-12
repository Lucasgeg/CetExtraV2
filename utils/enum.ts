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

export const getMissionJobValue = (jobLabel: string): EnumMissionJob => {
  const entries = Object.entries(EnumMissionJob) as [
    keyof typeof EnumMissionJob,
    EnumMissionJob
  ][];
  const found = entries.find(([key, _]) => key === jobLabel.toUpperCase());
  if (!found) {
    throw new Error(`Invalid job label: ${jobLabel}`);
  }
  return found[1];
};
