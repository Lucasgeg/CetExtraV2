import { EnumMissionJob, PrismaMissionJob } from "@/store/types";

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

export function convertToDbMissionJob(
  frontendJob: EnumMissionJob | string
): PrismaMissionJob {
  // Si c'est une chaîne, convertir en majuscules pour normaliser
  const jobKey =
    typeof frontendJob === "string" ? frontendJob.toUpperCase() : frontendJob;

  // Gérer les clés d'enum (WAITER, COOK)
  switch (jobKey) {
    case "WAITER":
    case EnumMissionJob.WAITER:
      return PrismaMissionJob.waiter;
    case "COOK":
    case EnumMissionJob.COOK:
      return PrismaMissionJob.cook;
    default:
      // Tenter de voir si c'est une valeur d'enum (Serveur, Cuisinier)
      if (typeof frontendJob === "string") {
        const entries = Object.entries(EnumMissionJob);
        for (const [key, value] of entries) {
          if (value === frontendJob) {
            switch (key) {
              case "WAITER":
                return PrismaMissionJob.waiter;
              case "COOK":
                return PrismaMissionJob.cook;
            }
          }
        }
      }

      throw new Error(`Job type not supported: ${frontendJob}`);
  }
}

export function convertToFrontendMissionJob(
  dbJob: PrismaMissionJob
): EnumMissionJob {
  switch (dbJob) {
    case PrismaMissionJob.waiter:
      return EnumMissionJob.WAITER;
    case PrismaMissionJob.cook:
      return EnumMissionJob.COOK;
    default:
      throw new Error(`DB job type not supported: ${dbJob}`);
  }
}
