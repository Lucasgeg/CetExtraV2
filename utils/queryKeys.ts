import type { UserMissionStatus } from "@prisma/client";
import type { EngagementScope } from "@/types/MeEngagements";

/**
 * Clés TanStack Query centralisées. Hiérarchiques : invalider un préfixe
 * (ex. `missions.byId(id)`) invalide toutes les requêtes en dessous.
 */
export type CompanyMissionsFilters = Record<string, string | number>;

/** Filtres de `GET /api/me/engagements` (voir `types/MeEngagements.ts`). */
export type MeEngagementsFilters = {
  status?: UserMissionStatus[];
  scope?: EngagementScope;
};

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
  },
  /** Données de l'utilisateur connecté (résolu par la session côté API). */
  me: {
    all: ["me"] as const,
    engagements: (filters: MeEngagementsFilters = {}) =>
      ["me", "engagements", filters] as const
  }
};
