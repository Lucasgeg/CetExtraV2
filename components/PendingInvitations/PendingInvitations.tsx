import { EnveloppeClock } from "@/components/icons";
import {
  DetailsList,
  DetailListItem
} from "@/components/ui/DetailsList/DetailsList";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Loader } from "@/components/ui/Loader/Loader";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import useFetch from "@/hooks/useFetch";
import { EnumMissionJob } from "@/store/types";
import {
  GetMissionInvitesResponse,
  PendingEmployee,
  PendingInvitation
} from "@/types/GetMissionIdInvites";
import { formatDateTimeLocal } from "@/utils/date";
import { getJobLabel } from "@/utils/enum";
import { capitalizeFirstLetter } from "@/utils/string";
import { InformationCircleIcon, TrashIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useCallback } from "react";
import { Button } from "../ui/button";

type PendingInvitationsProps = {
  missionId: string;
};

// Type commun pour les deux types d'invitations
type InvitationCardProps = {
  id: string;
  displayText: string;
  detailsItems: DetailListItem[];
  profilePictureUrl?: string | null;
  onCancel: () => void;
};

// Composant pour une carte d'invitation
function InvitationCard({
  id,
  displayText,
  detailsItems,
  profilePictureUrl,
  onCancel
}: InvitationCardProps) {
  return (
    <div
      key={id}
      className="bg-surface flex items-center justify-between rounded-lg border border-border px-4 py-2"
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
        <span className="text-sm font-medium text-black-soft">
          {displayText}
        </span>
      </div>
      <div className="flex space-x-2">
        <Popover modal>
          <PopoverTrigger asChild>
            <InformationCircleIcon className="h-full w-6 cursor-pointer stroke-employer-primary" />
          </PopoverTrigger>
          <PopoverContent className="w-fit">
            <DetailsList items={detailsItems} />
          </PopoverContent>
        </Popover>
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
            <Button variant="destructive" onClick={onCancel}>
              Annuler l'invitation
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export function PendingInvitations({ missionId }: PendingInvitationsProps) {
  const {
    data: invitesData,
    error: invitesError,
    loading: invitesLoading,
    refetch: refetchInvites
  } = useFetch<GetMissionInvitesResponse>(`/api/missions/${missionId}/invites`);

  const handleCancelInvitation = useCallback(
    async (invitationId: string, registered: boolean) => {
      try {
        const response = await fetch(
          `/api/missions/${missionId}/invites/${invitationId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ registered })
          }
        );

        if (!response.ok) {
          throw new Error("Erreur lors de l'annulation de l'invitation");
        }

        refetchInvites();
      } catch (error) {
        console.error("Erreur:", error);
      }
    },
    [missionId, refetchInvites]
  );

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
    if (invitesLoading) return <Loader variant="spinner" size="sm" />;
    if (invitesError)
      return (
        <p className="text-red-500">
          Erreur lors du chargement des invitations
        </p>
      );
    if (!invitesData) return null;

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
        {/* Utilisateurs enregistrés */}
        {invitesData.pendingEmployees.map((employee) => (
          <InvitationCard
            key={employee.id}
            id={employee.id}
            displayText={`${employee.user.firstName} ${employee.user.lastName}`}
            profilePictureUrl={employee.user.profilePictureUrl}
            detailsItems={createDetailsItems(employee)}
            onCancel={() => handleCancelInvitation(employee.id, true)}
          />
        ))}

        {/* Invitations par email */}
        {invitesData.invitations.map((invitation) => (
          <InvitationCard
            key={invitation.id}
            id={invitation.id}
            displayText={invitation.email}
            detailsItems={createDetailsItems(invitation)}
            onCancel={() => handleCancelInvitation(invitation.id, false)}
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
        {renderInvitationList()}
      </DialogContent>
    </Dialog>
  );
}
