import { MissionJob } from "@prisma/client";

/**
 * Type représentant un utilisateur enregistré invité à une mission
 * avec statut 'pending' (via UserMission)
 */
export interface PendingEmployee {
  id: string;
  user: {
    id: string;
    email: string;

    firstName: string | null;
    lastName: string | null;

    profilePictureUrl: string | null;
  };
  missionJob: MissionJob;
  missionStartDate: string; // ISO date string
  missionEndDate: string; // ISO date string
}

/**
 * Type représentant une invitation envoyée par email à une personne
 * qui n'est pas encore inscrite sur la plateforme
 */
export interface PendingInvitation {
  id: string;
  email: string;
  missionJob: MissionJob;
  missionStartDate: string; // ISO date string
  missionEndDate: string; // ISO date string
}

/**
 * Type pour les compteurs d'invitations
 */
export interface InvitationsCount {
  employees: number; // Utilisateurs enregistrés invités (status: pending)
  invitations: number; // Invitations par email
  total: number; // Somme des deux (calculé côté client ou serveur)
}

/**
 * Réponse complète de l'API GET /api/missions/[missionId]/invites
 */
export interface GetMissionInvitesResponse {
  /**
   * Utilisateurs enregistrés qui ont été invités à la mission
   * mais n'ont pas encore accepté (statut "pending")
   */
  pendingEmployees: PendingEmployee[];

  /**
   * Invitations envoyées par email à des personnes
   * qui ne sont pas encore inscrites sur la plateforme
   */
  invitations: PendingInvitation[];

  /**
   * Statistiques sur les invitations
   */
  counts: InvitationsCount;
}
