import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { MeEngagementsResponse } from "@/types/MeEngagements";
import { apiFetch } from "@/utils/apiFetch";
import { groupEngagements } from "@/utils/myEngagements.util";
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
    // 30 s (comme la config globale) : pas de second chargement en passant
    // de l'accueil à la page « Mes candidatures »
    staleTime: 30_000,
    // Volontairement activé ici, contrairement à la config globale : les
    // statuts changent par des décisions de l'employeur, jamais par une
    // mutation locale (rien à invalider côté extra), et ces écrans n'ont pas
    // de modale dont le contenu changerait sous les yeux de l'utilisateur
    refetchOnWindowFocus: true
  });

/**
 * `useMyEngagements` sans filtre + regroupement par section (invitations,
 * candidatures, à venir, historique).
 */
export const useGroupedEngagements = () => {
  // Destructuration explicite (pas de `...query`) : conserve le suivi des
  // propriétés lues par TanStack Query, donc pas de rendu superflu
  const { data, dataUpdatedAt, isPending, isError, isFetching, refetch } =
    useMyEngagements();

  // Référence temporelle = instant de la dernière réponse : stable entre deux
  // rendus, mise à jour à chaque revalidation
  const now = useMemo(
    () => new Date(dataUpdatedAt || Date.now()),
    [dataUpdatedAt]
  );
  const engagements = data?.engagements;
  const grouped = useMemo(
    () => groupEngagements(engagements ?? [], now),
    [engagements, now]
  );

  return {
    data,
    isPending,
    isError,
    isFetching,
    refetch,
    engagements,
    grouped,
    now
  };
};
