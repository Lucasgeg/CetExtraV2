import { Suggestion } from "@/types/api";
import { Company, Extra, EnumRole } from "./dbType";

export type UserSignUpSchema = {
  email: string;
  clerkId: string;
  role: EnumRole;
  location?: Suggestion;
  password: string;
  confirmPassword: string;
  // Champs communs à Extra et Company
  active?: boolean;
  // Champs spécifiques à Extra
  extra?: Extra;
  // Champs spécifiques à Company
  company?: Omit<Company, "id">;
  description?: string;
  profilePhoto?: File | Blob | null;
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
  clerk?: string;
  api?: string;
  verification?: string;
};
