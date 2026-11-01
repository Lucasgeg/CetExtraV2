import type { MissionJob, UserMissionStatus } from "@prisma/client";
import type { EnumMissionJob } from "@/store/types";

type Location = {
  fullName?: string;
};

/**
 * Liste blanche des statuts de UserMission pour lesquels l'employeur voit les
 * coordonnées : son équipe (`accepted`) et les invitations qu'il a lui-même
 * envoyées (`pending`). Tout autre statut, y compris un statut futur, est
 * masqué par défaut.
 */
export const CONTACT_VISIBLE_USER_MISSION_STATUSES = [
  "accepted",
  "pending"
] as const satisfies readonly UserMissionStatus[];

export type ContactVisibleUserMissionStatus =
  (typeof CONTACT_VISIBLE_USER_MISSION_STATUSES)[number];

/**
 * UserMission sans coordonnées (candidature `requested`, `refused`,
 * `cancelled`…) : ni email, ni téléphone, ni identifiant utilisateur (défense en
 * profondeur : l'id ne doit pas servir de clé vers d'autres endpoints).
 */
export type CompanyMissionEmployeeMasked<TJob = MissionJob> = {
  /** UserMission.id */
  id: string;
  missionJob: TJob;
  status: Exclude<UserMissionStatus, ContactVisibleUserMissionStatus>;
  user: {
    extra: { first_name: string; last_name: string } | null;
  };
};

/** UserMission de l'équipe (`accepted`) ou invitation envoyée (`pending`). */
export type CompanyMissionEmployeeWithContact<TJob = MissionJob> = {
  /** UserMission.id */
  id: string;
  userId: string;
  missionJob: TJob;
  status: ContactVisibleUserMissionStatus;
  user: {
    id: string;
    email: string;
    extra: {
      first_name: string;
      last_name: string;
      phone: string | null;
    } | null;
  };
};

/**
 * Élément de `employees` renvoyé par GET /api/companies/[companyId]/missions
 * (`fields=...,employees`). Discriminé par `status` : coordonnées présentes
 * uniquement pour `accepted` et `pending`.
 */
export type CompanyMissionEmployee<TJob = MissionJob> =
  | CompanyMissionEmployeeMasked<TJob>
  | CompanyMissionEmployeeWithContact<TJob>;

export type GetCompanyMission = {
  id: string;
  name: string;
  missionStartDate: Date;
  missionEndDate: Date;
  missionLocation: Location;
  /** Présent seulement si `employees` est demandé dans `fields`. */
  employees?: CompanyMissionEmployee[];
};

export interface PpxApiResponse {
  id: string;
  model: string;
  created: number;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    search_context_size: string;
  };
  citations: string[];
  object: string;
  choices: Choice[];
}

export interface Choice {
  index: number;
  finish_reason: string;
  message: {
    role: string;
    content: string;
  };
  delta: {
    role: string;
    content: string;
  };
}

export type GetPostByIdType = {
  id: string;
  title: string;
  content: string;
  keywords: string[];
  shortDesc: string;
  createdAt: Date;
  updatedAt: Date;
  published: boolean;
};

export type GetCommentByPostIdType = {
  postId: string;
  id: string;
  author: string;
  createdAt: Date;
  content: string;
};

export interface Suggestion {
  display_name: string;
  lat: number;
  lon: number;
}

type Address = {
  house_number: string;
  road: string;
  postcode: string;
  city?: string;
  town?: string;
  village?: string;
  country: string;
};

export type NominatimResponse = {
  address: Address;
  name?: string;
  lat: string;
  lon: string;
  place_id: number;
};

export type TeamCount = {
  [key in EnumMissionJob]?: number;
};

export type CreateMissionFormValues = {
  missionName: string;
  missionDescription?: string;
  missionStartDate: string;
  missionEndDate: string;
  additionalInfo?: string;
  location: Suggestion;
  extraJobOptions: EnumMissionJob[];
  teamCounts: TeamCount;
};

export enum EnumMissionSelector {
  ALL = "all",
  INCOMING = "incoming",
  PAST = "past"
}

export interface ApiErrorResponse {
  message: string;
}

export type TransactionResult =
  // biome-ignore lint/suspicious/noExplicitAny: transaction payload shape varies by caller
  | { success: true; data: any }
  | { success: false; error: string; status: number };
