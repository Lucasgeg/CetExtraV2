import { create } from "zustand";
import { MissionJob } from "@prisma/client";
import { UserWithLocation } from "@/types/UserWithLocation.enum";
import { MissionDetailApiResponse } from "@/types/MissionDetailApiResponse";

// Réutiliser le type existant pour RequiredPosition
export type RequiredPosition = MissionDetailApiResponse["requiredPositions"][0];

// Réutiliser le type de location depuis MissionDetailApiResponse
export type MissionLocation = NonNullable<
  MissionDetailApiResponse["missionLocation"]
>;

// Types spécifiques au store
export interface UserResearchFilters {
  selectedJobTypes: MissionJob[];
  radius: number;
  minExperience?: number;
  maxHourlyRate?: number;
  availabilityOnly?: boolean;
}

export interface UserResearchStore {
  // Données de la mission - réutilise les types de MissionDetailApiResponse
  missionId: string | null;
  missionName: string | null;
  missionStartDate?: string; // Même format ISO que MissionDetailApiResponse
  missionEndDate?: string; // Même format ISO que MissionDetailApiResponse
  missionLocation: MissionLocation | null;

  // Positions requises - type réutilisé
  requiredPositions: RequiredPosition[];

  // Utilisateurs filtrés - type existant
  filteredUsers: UserWithLocation[];

  // Filtres de recherche
  filters: UserResearchFilters;

  // États de l'interface
  isSearching: boolean;
  selectedUserId: string | null;
}

export interface UserResearchActions {
  // Actions pour les données de mission - utilise les types existants
  setMissionData: (
    data: Pick<
      MissionDetailApiResponse,
      "id" | "name" | "missionStartDate" | "missionEndDate" | "missionLocation"
    >
  ) => void;

  // Actions pour les positions requises
  setRequiredPositions: (positions: RequiredPosition[]) => void;
  addRequiredPosition: (position: RequiredPosition) => void;
  removeRequiredPosition: (positionId: string) => void;
  updateRequiredPosition: (
    positionId: string,
    updates: Partial<RequiredPosition>
  ) => void;

  // Actions pour les utilisateurs filtrés
  setFilteredUsers: (users: UserWithLocation[]) => void;
  addFilteredUser: (user: UserWithLocation) => void;
  removeFilteredUser: (userId: string) => void;

  // Actions pour les filtres
  setFilters: (filters: Partial<UserResearchFilters>) => void;
  updateFilter: <K extends keyof UserResearchFilters>(
    key: K,
    value: UserResearchFilters[K]
  ) => void;
  toggleJobType: (jobType: MissionJob) => void;
  resetFilters: () => void;

  // Actions pour l'interface
  setIsSearching: (isSearching: boolean) => void;
  setSelectedUserId: (userId: string | null) => void;

  // Actions utilitaires
  clearAll: () => void;
  getAvailableJobTypes: () => MissionJob[];
  getTotalPositionsCount: () => number;
  getPositionsByJobType: (jobType: MissionJob) => RequiredPosition[];
}

// État initial
const initialState: UserResearchStore = {
  missionId: null,
  missionName: null,
  missionStartDate: undefined,
  missionEndDate: undefined,
  missionLocation: null,
  requiredPositions: [],
  filteredUsers: [],
  filters: {
    selectedJobTypes: [],
    radius: 10,
    minExperience: undefined,
    maxHourlyRate: undefined,
    availabilityOnly: true
  },
  isSearching: false,
  selectedUserId: null
};

export const useUserResearchStore = create<
  UserResearchStore & UserResearchActions
>((set, get) => ({
  ...initialState,

  // Actions pour les données de mission
  setMissionData: (data) =>
    set({
      missionId: data.id,
      missionName: data.name,
      missionStartDate: data.missionStartDate,
      missionEndDate: data.missionEndDate,
      missionLocation: data.missionLocation
    }),

  // Actions pour les positions requises
  setRequiredPositions: (positions) => set({ requiredPositions: positions }),

  addRequiredPosition: (position) =>
    set((state) => ({
      requiredPositions: [...state.requiredPositions, position]
    })),

  removeRequiredPosition: (positionId) =>
    set((state) => ({
      requiredPositions: state.requiredPositions.filter(
        (p) => p.id !== positionId
      )
    })),

  updateRequiredPosition: (positionId, updates) =>
    set((state) => ({
      requiredPositions: state.requiredPositions.map((position) =>
        position.id === positionId ? { ...position, ...updates } : position
      )
    })),

  // Actions pour les utilisateurs filtrés
  setFilteredUsers: (users) => set({ filteredUsers: users }),

  addFilteredUser: (user) =>
    set((state) => ({
      filteredUsers: [...state.filteredUsers, user]
    })),

  removeFilteredUser: (userId) =>
    set((state) => ({
      filteredUsers: state.filteredUsers.filter((user) => user.id !== userId)
    })),

  // Actions pour les filtres
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters }
    })),

  updateFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value }
    })),

  toggleJobType: (jobType) =>
    set((state) => {
      const currentJobTypes = state.filters.selectedJobTypes;
      const isSelected = currentJobTypes.includes(jobType);

      return {
        filters: {
          ...state.filters,
          selectedJobTypes: isSelected
            ? currentJobTypes.filter((type) => type !== jobType)
            : [...currentJobTypes, jobType]
        }
      };
    }),

  resetFilters: () =>
    set((state) => ({
      filters: {
        ...initialState.filters,
        selectedJobTypes: []
      }
    })),

  // Actions pour l'interface
  setIsSearching: (isSearching) => set({ isSearching }),
  setSelectedUserId: (userId) => set({ selectedUserId: userId }),

  // Actions utilitaires
  clearAll: () => set(initialState),

  getAvailableJobTypes: () => {
    const { requiredPositions } = get();
    return Array.from(new Set(requiredPositions.map((p) => p.jobType)));
  },

  getTotalPositionsCount: () => {
    const { requiredPositions } = get();
    return requiredPositions.reduce(
      (total, position) => total + position.quantity,
      0
    );
  },

  getPositionsByJobType: (jobType) => {
    const { requiredPositions } = get();
    return requiredPositions.filter((position) => position.jobType === jobType);
  }
}));

// Sélecteurs utilisant les types existants
export const selectMissionInfo = (
  state: UserResearchStore & UserResearchActions
) => ({
  id: state.missionId,
  name: state.missionName,
  startDate: state.missionStartDate,
  endDate: state.missionEndDate,
  location: state.missionLocation
});

export const selectActiveFilters = (
  state: UserResearchStore & UserResearchActions
) => ({
  jobTypes: state.filters.selectedJobTypes,
  radius: state.filters.radius,
  hasExperienceFilter: state.filters.minExperience !== undefined,
  hasRateFilter: state.filters.maxHourlyRate !== undefined,
  availabilityOnly: state.filters.availabilityOnly
});
