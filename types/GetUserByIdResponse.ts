import type { PrismaMissionJob } from "@/store/types";

/**
 * Profil public d'un extra renvoyé à une entreprise par GET /api/users/[userId].
 * Volontairement minimal (RGPD) : pas d'email, de téléphone ni de date de
 * naissance. Les coordonnées ne passent que par les employés d'une mission de
 * l'entreprise ayant accepté (statut `accepted`, cf.
 * `CONTACT_VISIBLE_USER_MISSION_STATUSES`).
 */
export type GetUserByIdResponse = {
  id: string;
  description?: string;
  profilePictureUrl?: string;
  extra: {
    firstName: string;
    lastName: string;
    missionJobs: Array<{
      missionJob: PrismaMissionJob;
      experience: number;
    }>;
  };
};
