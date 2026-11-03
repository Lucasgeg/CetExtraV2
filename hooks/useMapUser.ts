import { useCallback, useEffect, useState } from "react";
import type {
  NearbyUsersResponse,
  UserWithLocation
} from "@/types/UserWithLocation.enum";

interface UseMapUsersProps {
  missionLocation: { lat: number; lon: number };
  enabled?: boolean;
  radius?: number;
}

/**
 * Récupère les extras autour de la mission. Les positions renvoyées par l'API
 * sont toujours approximatives (grille ~1 km, brouillage côté serveur).
 */
export const useMapUsers = ({
  missionLocation,
  enabled = true,
  radius = 50
}: UseMapUsersProps) => {
  const [users, setUsers] = useState<UserWithLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!enabled || !missionLocation.lat || !missionLocation.lon) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/users/nearby?lat=${missionLocation.lat}&lon=${missionLocation.lon}&radius=${radius}`
      );

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data: NearbyUsersResponse = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur inconnue";
      setError(errorMessage);
      console.error("Erreur lors du chargement des utilisateurs:", err);
    } finally {
      setLoading(false);
    }
  }, [enabled, missionLocation.lat, missionLocation.lon, radius]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    refetch: fetchUsers
  };
};
