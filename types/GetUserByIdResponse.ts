export type GetUserByIdResponse = {
  id: string;
  email: string;
  description?: string;
  profilePictureUrl?: string;
  extra?: {
    birthdateIso: string;
    firstName: string;
    lastName: string;
    missionJobs: Array<{
      missionJob: string;
      experience: string;
    }>;
    phone?: string;
  };
  company?: {
    userId: string;
    id: string;
    companyName: string;
    companyPhone?: string;
    contactFirstName: string;
    contactLastName: string;
    logoId?: string;
  };
};
