import type { MissionJob, Prisma } from "@prisma/client";
import { MissionStatus, UserMissionStatus } from "@prisma/client";

/**
 * Partie SQL-exprimable du prédicat de visibilité publique d'une mission
 * (voir docs/adr/0002 et CONTEXT.md « Mission visible »).
 *
 * Fonction et non constante : missionStartDate est comparée à l'instant de la
 * requête. Le reste du prédicat (postes non tous pourvus) n'est pas exprimable
 * en `where` Prisma — voir getOpenPositions.
 */
export const publicMissionVisibilityWhere = (): Prisma.MissionWhereInput => ({
  isPublic: true,
  status: MissionStatus.pending,
  missionLocationId: { not: null },
  missionStartDate: { gt: new Date() }
});

/**
 * Sélection des champs public-safe d'une mission (listing et détail publics).
 * Forme figée par construction : ne jamais y ajouter employees/invitations
 * détaillés ni de champ interne (additionalInfo reste privé).
 */
export const publicMissionSelect = {
  id: true,
  name: true,
  description: true,
  createdAt: true,
  missionStartDate: true,
  missionEndDate: true,
  hourlyRateMin: true,
  hourlyRateMax: true,
  missionLocation: {
    select: { fullName: true, lat: true, lon: true }
  },
  creator: {
    select: { company_name: true, businessSector: true, logoId: true }
  },
  requiredPositions: {
    select: { jobType: true, quantity: true }
  },
  employees: {
    where: { status: UserMissionStatus.accepted },
    select: { missionJob: true }
  }
} satisfies Prisma.MissionSelect;

/**
 * Postes encore ouverts d'une mission : quantité requise moins engagements
 * `accepted` du même jobType (les invitations/candidatures en attente ne
 * réservent pas de place — voir CONTEXT.md « Poste pourvu »).
 * Liste vide = tous les postes pourvus = mission non visible publiquement.
 */
export const getOpenPositions = (
  requiredPositions: { jobType: MissionJob; quantity: number }[],
  acceptedEmployees: { missionJob: MissionJob }[]
): { jobType: MissionJob; remaining: number }[] => {
  const acceptedByJob = new Map<MissionJob, number>();
  for (const { missionJob } of acceptedEmployees) {
    acceptedByJob.set(missionJob, (acceptedByJob.get(missionJob) ?? 0) + 1);
  }

  return requiredPositions
    .map(({ jobType, quantity }) => ({
      jobType,
      remaining: quantity - (acceptedByJob.get(jobType) ?? 0)
    }))
    .filter(({ remaining }) => remaining > 0);
};
