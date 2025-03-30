import { Company, Extra, UserLocation, Role } from "./dbType";

export type UserSignUpSchema = {
  email: string;
  clerkId: string;
  role: Role;
  location: Omit<UserLocation, "id">;
  password: string;
  confirmPassword: string;
  // Champs communs à Extra et Company
  active?: boolean;
  // Champs spécifiques à Extra
  extra?: Extra;
  // Champs spécifiques à Company
  company?: Omit<Company, "id">;
};

export type ExtraErrorMessages = {
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  location?: string;
};

export type CompanyErrorMessages = {
  companyName?: string;
  contactFirstName?: string;
  contactLastName?: string;
  location?: string;
};

export type GlobalErrorMessages = {
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export type SignupErrorMessages = {
  extra?: ExtraErrorMessages;
  company?: CompanyErrorMessages;
  global?: GlobalErrorMessages;
};
