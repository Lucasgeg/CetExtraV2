import { User } from "@prisma/client";
import { create } from "zustand";

export type SignUpStore = {
  user: User | null;
  setUser: (user: Partial<User>) => void;
  updateUserProperty: <K extends keyof User>(key: K, value: User[K]) => void;
  password: string;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (confirmPassword: string) => void;
};

export const useSignUpStore = create<SignUpStore>((set) => ({
  user: null,
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
