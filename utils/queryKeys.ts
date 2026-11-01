/**
 * Clés TanStack Query centralisées. Hiérarchiques : invalider un préfixe
 * (ex. `missions.byId(id)`) invalide toutes les requêtes en dessous.
 */
export type CompanyMissionsFilters = Record<string, string | number>;

export const queryKeys = {
  missions: {
    all: ["missions"] as const,
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
