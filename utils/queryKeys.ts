/**
 * Clés TanStack Query centralisées. Hiérarchiques : invalider un préfixe
 * (ex. `missions.byId(id)`) invalide toutes les requêtes en dessous.
 */
export type CompanyMissionsFilters = Record<string, string | number>;

/** Filtres du listing public (`GET /api/missions/public`). */
export type PublicMissionsFilters = {
  lat: number | null;
  lon: number | null;
  radius: number | null;
  page: number;
};

export const queryKeys = {
  missions: {
    all: ["missions"] as const,
    /** Surfaces publiques (listing de la vitrine `/missions`). */
    publicAll: ["missions", "public"] as const,
    publicList: (filters: PublicMissionsFilters) =>
      ["missions", "public", "list", filters] as const,
    byId: (missionId: string) => ["missions", missionId] as const,
    detail: (missionId: string) => ["missions", missionId, "detail"] as const,
    applications: (missionId: string) =>
      ["missions", missionId, "applications"] as const,
    invites: (missionId: string) => ["missions", missionId, "invites"] as const
  },
  companies: {
    all: ["companies"] as const,
    missions: (companyId: string, filters: CompanyMissionsFilters) =>
      ["companies", companyId, "missions", filters] as const
  },
  users: {
    profile: (userId: string) => ["users", userId, "profile"] as const
  }
};
