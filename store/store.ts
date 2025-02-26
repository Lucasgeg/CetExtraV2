import { Company, Extra, Location, MissionJob, Role } from "@prisma/client";
import { create } from "zustand";

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

export type SignUpStore = {
  user: Partial<UserSignUpSchema> | null;
  setUser: (user: Partial<UserSignUpSchema>) => void;
  updateUserProperty: <K extends keyof UserSignUpSchema>(
    key: K,
    value: UserSignUpSchema[K]
  ) => void;
  updateExtraProperty: <K extends keyof Partial<Omit<Extra, "id">>>(
    key: K,
    value: Partial<Omit<Extra, "id">>[K]
  ) => void;
  updateCompanyProperty: <K extends keyof UserSignUpSchema["company"]>(
    key: K,
    value: UserSignUpSchema["company"][K]
  ) => void;
  password: string;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (confirmPassword: string) => void;
};

export const useSignUpStore = create<SignUpStore>((set) => ({
  user: {
    role: Role.extra,
    extra: {
      missionJob: MissionJob.waiter,
    },
  },
  password: "",
  confirmPassword: "",
  setUser: (newUser: Partial<UserSignUpSchema>) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...newUser } : newUser,
    })),
  updateUserProperty: (key, value) =>
    set((state) => ({
      user: state.user ? { ...state.user, [key]: value } : { [key]: value },
    })),
  updateExtraProperty: (key, value) =>
    set((state) => ({
      user:
        state.user && state.user.extra
          ? { ...state.user, extra: { ...state.user.extra, [key]: value } }
          : { ...state.user, extra: { [key]: value } },
    })),
  updateCompanyProperty: (key, value) =>
    set((state) => ({
      user:
        state.user && state.user.company
          ? { ...state.user, company: { ...state.user.company, [key]: value } }
          : { ...state.user, company: { [key]: value } },
    })),
  setPassword: (password: string) => set({ password }),
  setConfirmPassword: (confirmPassword: string) => set({ confirmPassword }),
}));
