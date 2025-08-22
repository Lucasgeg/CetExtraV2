import { create } from "zustand";
import { persist } from "zustand/middleware";

type CurrentuserStore = {
  userId: string;
  extraId: string | null;
  companyId: string | null;
  userFirstName?: string;
};

type Action = {
  setUser: (user: CurrentuserStore) => void;
  reset: () => void;
};

const initialState: CurrentuserStore = {
  userId: "",
  extraId: null,
  companyId: null
};

export const useCurrentUserStore = create<CurrentuserStore & Action>()(
  persist(
    (set) => ({
      userId: initialState.userId,
      extraId: initialState.extraId,
      companyId: initialState.companyId,
      setUser: (user: CurrentuserStore) => set(() => ({ ...user })),
      reset: () => set(() => ({ ...initialState }))
    }),
    {
      name: "currentUserStore"
    }
  )
);
