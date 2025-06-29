import { EnumMissionJob } from "@/store/types";

export const getJobLabel = (jobEnum: EnumMissionJob): string => {
  if (Object.values(EnumMissionJob).includes(jobEnum)) {
    return jobEnum;
  }
  // Sinon, chercher par clé
  return (
    EnumMissionJob[jobEnum as unknown as keyof typeof EnumMissionJob] || jobEnum
  );
};
