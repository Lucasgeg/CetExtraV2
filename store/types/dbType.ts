import { Suggestion } from "@/types/api";

// Enums
export enum EnumMissionJob {
  WAITER = "Serveur / Serveuse",
  CHEF_DE_RANG = "Chef de rang",
  MAITRE_HOTEL = "Maître d'hôtel",
  COMMIS_SALLE = "Commis de salle",
  RUNNER = "Runner (débarrasseur)",
  BARTENDER = "Barman / Barmaid",
  SOMMELIER = "Sommelier / Sommelière",
  HOST = "Hôte / Hôtesse d'accueil",
  DINING_MANAGER = "Responsable de salle",
  COOK = "Cuisinier / Cuisinière",
  CHEF_DE_PARTIE = "Chef de partie",
  COMMIS_KITCHEN = "Commis de cuisine",
  SOUS_CHEF = "Second de cuisine",
  DISHWASHER = "Plongeur cuisine",
  PASTRY_CHEF = "Pâtissier / Pâtissière"
}

export enum PrismaMissionJob {
  waiter = "waiter",
  chefDeRang = "chefDeRang",
  maitreHotel = "maitreHotel",
  commisSalle = "commisSalle",
  runner = "runner",
  bartender = "bartender",
  sommelier = "sommelier",
  host = "host",
  diningManager = "diningManager",
  cook = "cook",
  chefDePartie = "chefDePartie",
  commisKitchen = "commisKitchen",
  sousChef = "sousChef",
  dishwasher = "dishwasher",
  pastryChef = "pastryChef"
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
  address: Suggestion;
  extra?: Extra;
  company?: Company;
};

export type Extra = {
  first_name: string;
  last_name: string;
  birthdate?: Date;
  phone?: string;
  missionJob: ExtraMissionJob[];
  max_travel_distance: number;
};

export type ExtraMissionJob = {
  missionJob: EnumMissionJob;
  experience: number;
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
