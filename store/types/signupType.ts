import { Company, Extra, Location, Role } from "./dbType";

export type UserSignUpSchema = {
  email: string;
  role: Role;
  location: Omit<Location, "id">;
  password: string;
  confirmPassword: string;
  // Champs communs à Extra et Company
  active?: boolean;
  // Champs spécifiques à Extra
  extra?: Partial<Omit<Extra, "id">>;
  // Champs spécifiques à Company
  company?: Partial<Omit<Company, "id">>;
};

export type ExtraErrorMessages = {
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  location?: string;
};

export type GlobalErrorMessages = {
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export type SignupErrorMessages = {
  extra?: ExtraErrorMessages;
  global?: GlobalErrorMessages;
};
