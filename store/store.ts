import { Location, MissionJob, Role, User } from "@prisma/client";
import { create } from "zustand";

export type UserSignUpSchema = User & {
  password: string;
  confirmPassword: string;
  location: Omit<Location, Location["id"]>;
};

export type SignUpStore = {
  user: Partial<User> | null;
  setUser: (user: Partial<User>) => void;
  updateUserProperty: <K extends keyof UserSignUpSchema>(
    key: K,
    value: UserSignUpSchema[K]
  ) => void;
  password: string;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (confirmPassword: string) => void;
};

export const useSignUpStore = create<SignUpStore>((set) => ({
  user: {
    missionJob: MissionJob.waiter,
    role: Role.extra,
  },
  password: "",
  confirmPassword: "",
  setUser: (newUser: Partial<User>) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...newUser } : (newUser as User),
    })),
  updateUserProperty: (key, value) =>
    set((state) => ({
      user: state.user
        ? { ...state.user, [key]: value }
        : { ...({} as User), [key]: value },
    })),
  setPassword: (password: string) => set({ password }),
  setConfirmPassword: (confirmPassword: string) => set({ confirmPassword }),
}));
