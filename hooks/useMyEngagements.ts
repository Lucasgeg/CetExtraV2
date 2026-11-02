import { useQuery } from "@tanstack/react-query";
import type { MeEngagementsResponse } from "@/types/MeEngagements";
import { apiFetch } from "@/utils/apiFetch";
import { type MeEngagementsFilters, queryKeys } from "@/utils/queryKeys";

/**
 * Engagements (invitations, candidatures, missions) de l'extra connecté.
 * Sans filtre, une seule entrée de cache partagée par l'accueil extra et la
 * page « Mes candidatures ».
 */
export const useMyEngagements = (filters: MeEngagementsFilters = {}) =>
  useQuery({
    queryKey: queryKeys.me.engagements(filters),
    queryFn: ({ signal }) => {
      const params = new URLSearchParams();
      for (const status of filters.status ?? []) {
        params.append("status", status);
      }
      if (filters.scope) params.set("scope", filters.scope);
      const query = params.size > 0 ? `?${params}` : "";

      return apiFetch<MeEngagementsResponse>(`/api/me/engagements${query}`, {
        signal
      });
    },
    // Les statuts changent par des décisions de l'employeur, jamais par une
    // mutation locale : rien à invalider côté extra, donc revalidation au
    // montage (le cache s'affiche pendant ce temps) et au retour sur l'onglet
    // (pas de modale sur ces écrans)
    staleTime: 0,
    refetchOnWindowFocus: true
  });
