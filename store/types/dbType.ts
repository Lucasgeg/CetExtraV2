// Enums
export enum EnumMissionJob {
  WAITER = "Serveur",
  COOK = "Cuisinier"
}

export enum EnumRole {
  EXTRA = "extra",
  COMPANY = "company"
}

export interface UserLocation {
  id: string;
  lat: number;
  lon: number;
  fullName: string;
}

export type User = {
  role: EnumRole;
  email: string;
  address: UserLocation;
  extra?: Extra;
  company?: Company;
};

export type Extra = {
  first_name: string;
  last_name: string;
  birthdate?: Date;
  phone?: string;
  missionJob: EnumMissionJob;
  max_travel_distance: number;
};

export type Company = {
  company_name: string;
  contactFirstName: string;
  contactLastName: string;
  logoId?: string;
  company_phone?: string;
};

export type Mission = {
  name: string;
  description?: string;
  location: UserLocation;
  locationId: string;
  mission_date: Date;
  creator: Company;
  creatorId: string;
  employees: UserMission[];
};

export type UserMission = {
  id: string;
  user: User;
  userId: string;
  mission: Mission;
  missionId: string;
  start_date: Date;
  missionJob: EnumMissionJob;
  duration: number;
  hourly_rate: number;
};
