// Enums
export enum MissionJob {
  WAITER = "waiter",
  COOK = "cook",
  BOTH = "both",
}

export enum Role {
  EXTRA = "extra",
  COMPANY = "company",
}

export interface Location {
  id: string;
  lat: number;
  lon: number;
  fullName?: string;
}

export type User = {
  id: string;
  clerkId: string;
  role: Role;
  email: string;
  created_at: Date;
  updated_at: Date;
  address: Location;
  locationId: string;
  active: boolean;
  assignedMissions: UserMission[];
  extra?: Extra;
  company?: Company;
};

export type Extra = {
  id: string;
  user: User;
  userId: string;
  first_name: string;
  last_name: string;
  birthdate: Date;
  phone?: string;
  missionJob: MissionJob;
  max_travel_distance: number;
};

export type Company = {
  id: string;
  user: User;
  userId: string;
  company_name: string;
  registration_number: string;
  contact_person: string;
  company_phone: string;
  createdMissions: Mission[];
};

export type Mission = {
  id: string;
  name: string;
  description?: string;
  location: Location;
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
  missionJob: MissionJob;
  duration: number;
  hourly_rate: number;
};
