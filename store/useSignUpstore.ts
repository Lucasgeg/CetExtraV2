import { create } from "zustand";
import { SignupErrorMessages, UserSignUpSchema } from "./types/signupType";
import { Company, Extra, EnumMissionJob, EnumRole } from "./types";

export type SignUpStore = {
  user: Partial<UserSignUpSchema> | null;
  password: string;
  confirmPassword: string;
  errorMessages: SignupErrorMessages;
  extra?: Partial<Extra>;
  company: Partial<Company>;
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
  updateCompanyProperty: <K extends keyof Partial<Omit<Company, "id">>>(
    key: K,
    value: Partial<Omit<Company, "id">>[K]
  ) => void;

  setPassword: (password: string) => void;
  setConfirmPassword: (confirmPassword: string) => void;
  setErrorMessages: (errors: SignupErrorMessages) => void;
};
const initialState: UserSignUpSchema = {
  email: "",
  clerkId: "",
  role: EnumRole.EXTRA,
  location: {
    lat: 0,
    lon: 0,
    fullName: ""
  },
  password: "",
  confirmPassword: ""
};

export const useSignUpStore = create<SignUpStore & Actions>((set) => ({
  user: initialState,
  password: "",
  confirmPassword: "",
  errorMessages: {},
  extra: {
    missionJob: EnumMissionJob.WAITER,
    max_travel_distance: 5
  },
  company: {},
  setUser: (newUser: Partial<UserSignUpSchema>) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...newUser } : newUser
    })),
  updateUserProperty: (key, value) =>
    set((state) => ({
      user: state.user ? { ...state.user, [key]: value } : { [key]: value }
    })),
  updateExtraProperty(key, value) {
    set((state) => ({
      extra: state.extra ? { ...state.extra, [key]: value } : { [key]: value }
    }));
  },
  updateCompanyProperty: (key, value) =>
    set((state) => ({
      company: state.company
        ? { ...state.company, [key]: value }
        : { [key]: value }
    })),
  setPassword: (password: string) => set({ password }),
  setConfirmPassword: (confirmPassword: string) => set({ confirmPassword }),
  setErrorMessages: (errors) =>
    set((prev) => ({ ...prev, errorMessages: errors }))
}));
