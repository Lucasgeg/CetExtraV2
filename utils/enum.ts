import { EnumMissionJob, PrismaMissionJob } from "@/store/types";

/**
 * Mapping from frontend enum to Prisma enum values
 */
const FRONTEND_TO_DB_MAP: Record<
  keyof typeof EnumMissionJob,
  PrismaMissionJob
> = {
  WAITER: PrismaMissionJob.waiter,
  CHEF_DE_RANG: PrismaMissionJob.chefDeRang,
  MAITRE_HOTEL: PrismaMissionJob.maitreHotel,
  COMMIS_SALLE: PrismaMissionJob.commisSalle,
  RUNNER: PrismaMissionJob.runner,
  BARTENDER: PrismaMissionJob.bartender,
  SOMMELIER: PrismaMissionJob.sommelier,
  HOST: PrismaMissionJob.host,
  DINING_MANAGER: PrismaMissionJob.diningManager,
  COOK: PrismaMissionJob.cook,
  CHEF_DE_PARTIE: PrismaMissionJob.chefDePartie,
  COMMIS_KITCHEN: PrismaMissionJob.commisKitchen,
  SOUS_CHEF: PrismaMissionJob.sousChef,
  DISHWASHER: PrismaMissionJob.dishwasher,
  PASTRY_CHEF: PrismaMissionJob.pastryChef
};

/**
 * Mapping from Prisma enum to frontend enum values
 */
const DB_TO_FRONTEND_MAP: Record<
  PrismaMissionJob,
  keyof typeof EnumMissionJob
> = {
  [PrismaMissionJob.waiter]: "WAITER",
  [PrismaMissionJob.chefDeRang]: "CHEF_DE_RANG",
  [PrismaMissionJob.maitreHotel]: "MAITRE_HOTEL",
  [PrismaMissionJob.commisSalle]: "COMMIS_SALLE",
  [PrismaMissionJob.runner]: "RUNNER",
  [PrismaMissionJob.bartender]: "BARTENDER",
  [PrismaMissionJob.sommelier]: "SOMMELIER",
  [PrismaMissionJob.host]: "HOST",
  [PrismaMissionJob.diningManager]: "DINING_MANAGER",
  [PrismaMissionJob.cook]: "COOK",
  [PrismaMissionJob.chefDePartie]: "CHEF_DE_PARTIE",
  [PrismaMissionJob.commisKitchen]: "COMMIS_KITCHEN",
  [PrismaMissionJob.sousChef]: "SOUS_CHEF",
  [PrismaMissionJob.dishwasher]: "DISHWASHER",
  [PrismaMissionJob.pastryChef]: "PASTRY_CHEF"
};

/**
 * Définition des catégories de jobs
 */
export enum JobCategory {
  DINING_ROOM = "Salle",
  KITCHEN = "Cuisine"
}

/**
 * Jobs de la catégorie SALLE
 */
export const DINING_ROOM_JOBS = [
  "WAITER",
  "CHEF_DE_RANG",
  "MAITRE_HOTEL",
  "COMMIS_SALLE",
  "RUNNER",
  "BARTENDER",
  "SOMMELIER",
  "HOST",
  "DINING_MANAGER"
] as const;

/**
 * Jobs de la catégorie CUISINE
 */
export const KITCHEN_JOBS = [
  "COOK",
  "CHEF_DE_PARTIE",
  "COMMIS_KITCHEN",
  "SOUS_CHEF",
  "DISHWASHER",
  "PASTRY_CHEF"
] as const;

/**
 * Mapping des jobs vers leurs catégories
 */
export const JOB_CATEGORIES: Record<string, JobCategory> = {
  WAITER: JobCategory.DINING_ROOM,
  CHEF_DE_RANG: JobCategory.DINING_ROOM,
  MAITRE_HOTEL: JobCategory.DINING_ROOM,
  COMMIS_SALLE: JobCategory.DINING_ROOM,
  RUNNER: JobCategory.DINING_ROOM,
  BARTENDER: JobCategory.DINING_ROOM,
  SOMMELIER: JobCategory.DINING_ROOM,
  HOST: JobCategory.DINING_ROOM,
  DINING_MANAGER: JobCategory.DINING_ROOM,
  COOK: JobCategory.KITCHEN,
  CHEF_DE_PARTIE: JobCategory.KITCHEN,
  COMMIS_KITCHEN: JobCategory.KITCHEN,
  SOUS_CHEF: JobCategory.KITCHEN,
  DISHWASHER: JobCategory.KITCHEN,
  PASTRY_CHEF: JobCategory.KITCHEN
};

/**
 * Get the display label for a job enum
 */
export const getJobLabel = (
  jobEnum: EnumMissionJob | keyof typeof EnumMissionJob
): string => {
  // If it's already a display value, return it
  if (Object.values(EnumMissionJob).includes(jobEnum as EnumMissionJob)) {
    return jobEnum as string;
  }

  // If it's a key, convert to display value
  if (typeof jobEnum === "string" && jobEnum in EnumMissionJob) {
    return EnumMissionJob[jobEnum as keyof typeof EnumMissionJob];
  }

  // Default fallback
  return String(jobEnum);
};

/**
 * Get the enum key from a job display value
 */
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

/**
 * Get the enum value from a job key
 */
export const getMissionJobValue = (jobLabel: string): EnumMissionJob => {
  const normalizedKey = jobLabel.toUpperCase() as keyof typeof EnumMissionJob;

  if (!(normalizedKey in EnumMissionJob)) {
    throw new Error(`Invalid job label: ${jobLabel}`);
  }

  return EnumMissionJob[normalizedKey];
};

/**
 * Convert frontend job type to database job type
 */
export function convertToDbMissionJob(
  frontendJob: EnumMissionJob | string | keyof typeof EnumMissionJob
): PrismaMissionJob {
  // Case 1: It's an EnumMissionJob value (display string)
  if (Object.values(EnumMissionJob).includes(frontendJob as EnumMissionJob)) {
    const key = getMissionJobKey(frontendJob as string);
    return FRONTEND_TO_DB_MAP[key];
  }

  // Case 2: It's a key of EnumMissionJob
  const normalizedKey =
    typeof frontendJob === "string"
      ? (frontendJob.toUpperCase() as keyof typeof EnumMissionJob)
      : frontendJob;

  if (normalizedKey in FRONTEND_TO_DB_MAP) {
    return FRONTEND_TO_DB_MAP[normalizedKey as keyof typeof EnumMissionJob];
  }

  throw new Error(`Job type not supported: ${frontendJob}`);
}

/**
 * Convert database job type to frontend job type
 */
export function convertToFrontendMissionJob(
  dbJob: PrismaMissionJob
): EnumMissionJob {
  if (!(dbJob in DB_TO_FRONTEND_MAP)) {
    throw new Error(`DB job type not supported: ${dbJob}`);
  }

  const key = DB_TO_FRONTEND_MAP[dbJob];
  return EnumMissionJob[key];
}

/**
 * Obtenir la catégorie d'un job
 */
export function getJobCategory(
  job: string | keyof typeof EnumMissionJob
): JobCategory {
  const normalizedKey =
    typeof job === "string" ? job.toUpperCase() : String(job);

  if (normalizedKey in JOB_CATEGORIES) {
    return JOB_CATEGORIES[normalizedKey];
  }

  // Essayer de convertir depuis une valeur d'affichage
  if (Object.values(EnumMissionJob).includes(job as EnumMissionJob)) {
    const key = getMissionJobKey(job as string);
    return JOB_CATEGORIES[key];
  }

  throw new Error(`Job category not found for: ${job}`);
}

/**
 * Get all job options for dropdown menus
 */
export function getAllJobOptions(): { value: string; label: string }[] {
  return Object.entries(EnumMissionJob).map(([key, label]) => ({
    value: FRONTEND_TO_DB_MAP[key as keyof typeof EnumMissionJob],
    label
  }));
}

/**
 * Check if a job type is valid
 */
export function isValidJobType(job: string): boolean {
  return (
    Object.values(EnumMissionJob).includes(job as EnumMissionJob) ||
    Object.keys(EnumMissionJob).includes(job.toUpperCase())
  );
}

/**
 * Obtenir les options de jobs avec groupBy pour MultipleSelector
 */
export function getJobOptionsWithGroups(): Array<{
  value: string;
  label: string;
  category: string;
}> {
  return Object.entries(EnumMissionJob).map(([key, label]) => ({
    value: key,
    label: label,
    category: getJobCategory(key).toString()
  }));
}

/**
 * Obtenir les options formatées pour MultipleSelector avec Prisma values
 */
export function getJobOptionsForSelector(): Array<{
  value: string;
  label: string;
  category: string;
}> {
  return Object.entries(EnumMissionJob).map(([key, label]) => ({
    value: FRONTEND_TO_DB_MAP[key as keyof typeof EnumMissionJob],
    label: label,
    category: getJobCategory(key).toString()
  }));
}

/**
 * Obtenir tous les jobs par catégorie
 */
export function getJobsByCategory(
  category: JobCategory
): Array<keyof typeof EnumMissionJob> {
  return Object.entries(JOB_CATEGORIES)
    .filter(([_, jobCategory]) => jobCategory === category)
    .map(([key]) => key as keyof typeof EnumMissionJob);
}

/**
 * Vérifier si un job est dans la catégorie salle
 */
export function isDiningRoomJob(
  job: string | keyof typeof EnumMissionJob
): boolean {
  try {
    const category = getJobCategory(job);
    return category === JobCategory.DINING_ROOM;
  } catch (error) {
    return false;
  }
}

/**
 * Vérifier si un job est dans la catégorie cuisine
 */
export function isKitchenJob(
  job: string | keyof typeof EnumMissionJob
): boolean {
  try {
    const category = getJobCategory(job);
    return category === JobCategory.KITCHEN;
  } catch (error) {
    return false;
  }
}
