import { create } from "zustand";

type CurrentuserStore = {
  userId: string;
  extraId: string | null;
  companyId: string | null;
};

type Action = {
  setUser: (user: CurrentuserStore) => void;
  reset: () => void;
};

const initialState: CurrentuserStore = {
  userId: "",
  extraId: null,
  companyId: null,
};

export const useCurrentUserStore = create<CurrentuserStore & Action>((set) => ({
  userId: initialState.userId,
  extraId: initialState.extraId,
  companyId: initialState.companyId,
  setUser: (user: CurrentuserStore) => set(() => ({ ...user })),
  reset: () => set(() => ({ ...initialState })),
}));
