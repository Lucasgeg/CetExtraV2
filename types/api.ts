import { EnumMissionJob } from "@/store/types";

type Location = {
  fullName?: string;
};

export type GetCompanyMission = {
  id: string;
  name: string;
  missionStartDate: Date;
  missionEndDate: Date;
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | { success: true; data: any }
  | { success: false; error: string; status: number };
