import { create } from "zustand";
import { SignupErrorMessages, UserSignUpSchema } from "./types/signupType";
import { Extra, MissionJob, Role } from "./types";

export type SignUpStore = {
  user: Partial<UserSignUpSchema> | null;
  errorMessages: SignupErrorMessages;
};

export type Actions = {
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
  setErrorMessages: (errors: SignupErrorMessages) => void;
};

export const useSignUpStore = create<SignUpStore & Actions>((set) => ({
  user: {
    role: Role.EXTRA,
    extra: {
      missionJob: MissionJob.WAITER,
    },
  },
  errorMessages: {},
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
  setErrorMessages: (errors) =>
    set((prev) => ({ ...prev, errorMessages: errors })),
}));
