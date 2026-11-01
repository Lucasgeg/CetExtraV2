import { InformationCircleIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useState } from "react";
import { EnveloppeClock } from "@/components/icons";
import {
  type DetailListItem,
  DetailsList
} from "@/components/ui/DetailsList/DetailsList";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Loader } from "@/components/ui/Loader/Loader";
import type { EnumMissionJob } from "@/store/types";
import type {
  GetMissionInvitesResponse,
  PendingEmployee,
  PendingInvitation
} from "@/types/GetMissionIdInvites";
import { apiFetch } from "@/utils/apiFetch";
import { formatDateTimeLocal } from "@/utils/date";
import { getJobLabel } from "@/utils/enum";
import { queryKeys } from "@/utils/queryKeys";
import { capitalizeFirstLetter, formatFullName } from "@/utils/string";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "../ui/tooltip";

type PendingInvitationsProps = {
  missionId: string;
};

type CancelInvitationVariables = {
  invitationId: string;
  /** `true` : extra inscrit (UserMission) ; `false` : invitation par email */
  registered: boolean;
};

// Type commun pour les deux types d'invitations
type InvitationCardProps = {
  id: string;
  displayText: string;
  detailsItems: DetailListItem[];
  profilePictureUrl?: string | null;
  isCancelling: boolean;
  onCancel: () => void;
};

// Composant pour une carte d'invitation
function InvitationCard({
  id,
  displayText,
  detailsItems,
  profilePictureUrl,
  isCancelling,
  onCancel
}: InvitationCardProps) {
  const [openTooltip, setOpenTooltip] = useState(false);
  return (
    <div
      key={id}
      className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-2"
    >
      <div className="flex items-center space-x-3">
        {profilePictureUrl && (
          <Image
            src={profilePictureUrl}
            alt="profil"
            className="h-8 w-8 rounded-full object-cover"
            width={32}
            height={32}
          />
        )}
        <span className="font-medium text-black-soft text-sm">
          {displayText}
        </span>
      </div>
      <div className="flex space-x-2">
        <TooltipProvider>
          <Tooltip
            open={openTooltip}
            onOpenChange={setOpenTooltip}
            delayDuration={100}
          >
            <TooltipTrigger
              asChild
              onClick={() => setOpenTooltip(!openTooltip)}
            >
              <InformationCircleIcon className="h-full w-6 cursor-pointer stroke-employer-primary" />
            </TooltipTrigger>
            <TooltipContent className="w-fit">
              <DetailsList items={detailsItems} />
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Dialog>
          <DialogTrigger asChild>
            <TrashIcon className="h-full w-6 cursor-pointer stroke-employer-error" />
          </DialogTrigger>
          <DialogContent className="flex flex-col items-center">
            <DialogTitle>Annuler l'invitation</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Êtes-vous sûr de vouloir annuler
              l'invitation ?
            </DialogDescription>
            <Button
              variant="destructive"
              onClick={onCancel}
              disabled={isCancelling}
            >
              {isCancelling ? "Annulation..." : "Annuler l'invitation"}
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export function PendingInvitations({ missionId }: PendingInvitationsProps) {
  const queryClient = useQueryClient();
  // Rafraîchie par invalidation de `missions.invites(missionId)` : annulation
  // ci-dessous, invitation depuis le profil d'un extra (carte) ou depuis une
  // place libre de l'équipe
  const {
    data: invitesData,
    isPending: invitesPending,
    isError: invitesIsError
  } = useQuery({
    queryKey: queryKeys.missions.invites(missionId),
    queryFn: ({ signal }) =>
      apiFetch<GetMissionInvitesResponse>(
        `/api/missions/${missionId}/invites`,
        { signal }
      )
  });

  const cancelInvitation = useMutation({
    mutationFn: ({ invitationId, registered }: CancelInvitationVariables) =>
      apiFetch(`/api/missions/${missionId}/invites/${invitationId}`, {
        method: "PATCH",
        json: { registered }
      }),
    // Promesse renvoyée : la mutation reste « en cours » jusqu'à ce que la
    // liste rafraîchie soit arrivée (pas de carte fantôme réactivée)
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.missions.invites(missionId)
        }),
        // Compteur « Invitations en attente » du tableau de bord
        queryClient.invalidateQueries({ queryKey: queryKeys.companies.all })
      ]),
    onError: (error) => {
      console.error("Erreur lors de l'annulation de l'invitation :", error);
    }
  });

  const isCancelling = (invitationId: string) =>
    cancelInvitation.isPending &&
    cancelInvitation.variables?.invitationId === invitationId;

  // Fonction utilitaire pour générer les détails communs
  const createDetailsItems = (
    item: PendingEmployee | PendingInvitation
  ): DetailListItem[] => {
    return [
      {
        label: "Début",
        value: formatDateTimeLocal(item.missionStartDate)
      },
      {
        label: "Fin",
        value: formatDateTimeLocal(item.missionEndDate)
      },
      {
        label: "Poste",
        value: capitalizeFirstLetter(
          getJobLabel(item.missionJob.toUpperCase() as EnumMissionJob)
        )
      }
    ];
  };

  const renderInvitationCount = () => {
    if (invitesPending) return <Loader variant="spinner" size="sm" />;
    if (invitesIsError)
      return (
        <p className="text-red-500">
          Erreur lors du chargement des invitations
        </p>
      );

    return (
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex items-center justify-center gap-1 rounded-full border border-employer-border bg-employer-primary p-2 text-extra-primary shadow-md transition-colors hover:bg-employer-secondary focus:outline-none focus:ring-0"
        >
          <span>{invitesData.counts.total}</span>
          <EnveloppeClock height={24} color="#f7b742" />
        </button>
      </DialogTrigger>
    );
  };

  const renderInvitationList = () => {
    if (!invitesData) return null;

    const hasInvitations =
      invitesData.pendingEmployees.length > 0 ||
      invitesData.invitations.length > 0;

    if (!hasInvitations) {
      return <p>Aucune invitation en attente.</p>;
    }

    return (
      <div className="space-y-2">
        {/* Utilisateurs enregistrés : prénom/nom seulement, pas d'email avant
            acceptation (RGPD) */}
        {invitesData.pendingEmployees.map((employee) => (
          <InvitationCard
            key={employee.id}
            id={employee.id}
            displayText={formatFullName(
              employee.user.firstName,
              employee.user.lastName,
              "Extra invité"
            )}
            profilePictureUrl={employee.user.profilePictureUrl}
            detailsItems={createDetailsItems(employee)}
            isCancelling={isCancelling(employee.id)}
            onCancel={() =>
              cancelInvitation.mutate({
                invitationId: employee.id,
                registered: true
              })
            }
          />
        ))}

        {/* Invitations par email */}
        {invitesData.invitations.map((invitation) => (
          <InvitationCard
            key={invitation.id}
            id={invitation.id}
            displayText={invitation.email}
            detailsItems={createDetailsItems(invitation)}
            isCancelling={isCancelling(invitation.id)}
            onCancel={() =>
              cancelInvitation.mutate({
                invitationId: invitation.id,
                registered: false
              })
            }
          />
        ))}
      </div>
    );
  };

  return (
    <Dialog>
      {renderInvitationCount()}
      <DialogContent className="max-h-[50vh] overflow-y-auto bg-employer-surface">
        <DialogTitle>Invitations en attente</DialogTitle>
        {cancelInvitation.isError && (
          <p role="alert" className="text-red-500 text-sm">
            Erreur lors de l'annulation de l'invitation, veuillez réessayer.
          </p>
        )}
        {renderInvitationList()}
      </DialogContent>
    </Dialog>
  );
}
