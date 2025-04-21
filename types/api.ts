type Location = {
  fullName?: string;
};

export type GetCompanyMission = {
  id: string;
  name: string;
  mission_date: Date;
  missionLocation: Location;
};
