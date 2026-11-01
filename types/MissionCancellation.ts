export type MissionCancellationApiRequest = {
  message?: string;
};

/**
 * Réponse 200 de PATCH /api/missions/[missionId]/cancel. La mission est
 * annulée en base dès que cette réponse est reçue ; `emailFailures` > 0
 * signale seulement que certains extras n'ont pas pu être prévenus.
 */
export type MissionCancellationApiResponse = {
  success: true;
  cancelled: {
    /** Engagements (UserMission) passés à `cancelled`. */
    engagements: number;
    /** Invitations d'extras non inscrits passées à `cancelled`. */
    invitations: number;
  };
  /** Extras à qui un email d'annulation était destiné. */
  notified: number;
  /** Emails d'annulation non envoyés (erreur Resend). */
  emailFailures: number;
};
