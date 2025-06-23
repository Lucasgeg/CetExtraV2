import { EnumMissionJob } from "@/store/types";

type Location = {
  fullName?: string;
};

export type GetCompanyMission = {
  id: string;
  name: string;
  mission_start_date: Date;
  mission_end_date: Date;
  missionLocation: Location;
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
  place_id: number;
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
  missionDescription: string;
  missionStartDate: string;
  missionEndDate: string;
  additionalInfo?: string;
  location: Suggestion;
  extraJobOptions: EnumMissionJob[];
  teamCounts: TeamCount;
};

export enum AllowedFields {
  // Champs de base de Mission
  ID = "id",
  NAME = "name",
  DESCRIPTION = "description",
  MISSION_START_DATE = "mission_start_date",
  MISSION_END_DATE = "mission_end_date",
  ADDITIONAL_INFO = "additionalInfo",

  // Champs de MissionLocation
  LOCATION_FULL_NAME = "missionLocation.fullName",
  LOCATION_LAT = "missionLocation.lat",
  LOCATION_LON = "missionLocation.lon",

  // Champs de Creator (Company)
  CREATOR_COMPANY_NAME = "creator.company_name",

  // Champs pour UserMission (côté extra)
  START_DATE = "start_date",
  DURATION = "duration"
}

export enum EnumMissionSelector {
  ALL = "all",
  INCOMING = "incoming",
  PAST = "past"
}

export interface MissionLocation {
  id: string;
  lat: number;
  lon: number;
  fullName: string;
  nominatimId: number | null;
}

export interface RequiredPosition {
  id: string;
  missionId: string;
  jobType: EnumMissionJob;
  quantity: number;
}

export interface UserMission {
  id: string;
  userId: string;
  missionId: string;
  start_date: string;
  missionJob: EnumMissionJob;
  duration: number;
  hourly_rate: number;
  created_at: string;
  status: "pending" | "accepted" | "refused";
  updated_at: string;
}

export interface MissionDetailResponse {
  id: string;
  name: string;
  description: string | null;
  additionalInfo: string | null;
  mission_start_date: string;
  mission_end_date: string;
  creatorId: string;
  missionLocationId: string | null;
  missionLocation: MissionLocation | null;
  requiredPositions: RequiredPosition[];
  employees: UserMission[];
}

export interface ApiErrorResponse {
  message: string;
}

// Type union pour la réponse complète
export type MissionDetailApiResponse = MissionDetailResponse;
