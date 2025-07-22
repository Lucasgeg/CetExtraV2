import { MissionJob, MissionStatus, UserMissionStatus } from "@prisma/client";

export interface MissionDetailApiResponse {
  // Champs de base de la mission
  id: string;
  name: string;
  description: string | null;
  additionalInfo: string | null;
  missionStartDate: string; // ISO format date string
  missionEndDate: string; // ISO format date string
  creatorId: string;
  missionLocationId: string | null;
  status: MissionStatus;

  missionLocation: {
    id: string;
    lat: number;
    lon: number;
    fullName: string;
  } | null;

  requiredPositions: Array<{
    id: string;
    jobType: MissionJob;
    quantity: number;
  }>;

  employees: Array<{
    id: string;
    missionJob: MissionJob;
    status: UserMissionStatus;
    startDate: string; // ISO format date string
    duration: number; // in hours
    hourlyRate: number;
    user: {
      id: string;
      email: string;
      extra: {
        firstName: string;
        lastName: string;
      };
    };
  }>;
  invitations?: Array<{
    id: string;
  }>;
}
