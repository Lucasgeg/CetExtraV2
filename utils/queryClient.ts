import { QueryClient } from "@tanstack/react-query";
import { isHttpError } from "@/utils/apiFetch";

const MAX_RETRIES = 2;

/**
 * Pas de nouvel essai sur une erreur 4xx (403/404/409… ne changeront pas en
 * réessayant) ; quelques essais sur 5xx et erreurs réseau.
 */
export const shouldRetry = (failureCount: number, error: unknown) => {
  if (isHttpError(error) && error.status < 500) return false;
  return failureCount < MAX_RETRIES;
};

export const makeQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: shouldRetry,
        // Évite de refaire les mêmes appels en naviguant entre les pages ;
        // les mutations invalident explicitement ce qu'elles modifient
        staleTime: 30_000,
        // Désactivé : la page mission pousse les données dans le store
        // Zustand (formulaire d'édition) et porte plusieurs modales
        // (décision sur une candidature, carte, profil d'extra) ; un
        // rafraîchissement au retour sur l'onglet modifierait leur contenu
        // sous les yeux de l'utilisateur (voire ferait disparaître la
        // section des candidatures). À activer requête par requête si utile
        refetchOnWindowFocus: false
      },
      mutations: {
        retry: false
      }
    }
  });
