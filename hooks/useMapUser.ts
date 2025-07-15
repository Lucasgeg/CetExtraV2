import { useState, useEffect } from "react";
import {
  UserWithLocation,
  NearbyUsersResponse
} from "@/types/UserWithLocation.enum";

interface UseMapUsersProps {
  missionLocation: { lat: number; lon: number };
  enabled?: boolean;
  radius?: number;
  preservePrivacy?: boolean; // Nouveau paramètre
}

export const useMapUsers = ({
  missionLocation,
  enabled = true,
  radius = 50,
  preservePrivacy = true // Par défaut protégé
}: UseMapUsersProps) => {
  const [users, setUsers] = useState<UserWithLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [privacyProtected, setPrivacyProtected] = useState(preservePrivacy);

  const fetchUsers = async () => {
    if (!enabled || !missionLocation.lat || !missionLocation.lon) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/users/nearby?lat=${missionLocation.lat}&lon=${missionLocation.lon}&radius=${radius}&privacy=${preservePrivacy}`
      );

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data: NearbyUsersResponse = await response.json();
      setUsers(data.users || []);
      setPrivacyProtected(data.privacyProtected || false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur inconnue";
      setError(errorMessage);
      console.error("Erreur lors du chargement des utilisateurs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [
    missionLocation.lat,
    missionLocation.lon,
    enabled,
    radius,
    preservePrivacy
  ]);

  return {
    users,
    loading,
    error,
    privacyProtected,
    refetch: fetchUsers
  };
};
