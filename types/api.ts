type Location = {
  fullName?: string;
};

export type GetCompanyMission = {
  id: string;
  name: string;
  date: Date;
  location: Location;
};
