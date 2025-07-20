"use client";

import { MissionPoint } from "@/components/MapContainerComponent/DynamicMapContent";
import MapContainerComponent from "@/components/MapContainerComponent/MapContainerComponent";
import { MapWithUserFilter } from "@/components/MapWithUserFilter";
import { PendingInvitations } from "@/components/PendingInvitations/PendingInvitations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  DetailListItem,
  DetailsList
} from "@/components/ui/DetailsList/DetailsList";
import {
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  Dialog
} from "@/components/ui/dialog";
import { Loader } from "@/components/ui/Loader/Loader";
import { TeamGestionnaryItem } from "@/components/ui/TeamGestionnaryItem/TeamGestionnaryItem";
import useFetch from "@/hooks/useFetch";
import { EnumMissionJob } from "@/store/types";
import { MissionDetailApiResponse } from "@/types/MissionDetailApiResponse";
import { UserWithLocation } from "@/types/UserWithLocation.enum";
import { formatDateTimeLocal, formatDuration } from "@/utils/date";
import { getJobLabel } from "@/utils/enum";
import { capitalizeFirstLetter } from "@/utils/string";
import { LatLngExpression } from "leaflet";
import { useParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

export default function MissionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, error, loading, refetch } = useFetch<MissionDetailApiResponse>(
    `/api/missions/${id}`
  );

  const [fullScreenMapOpen, setFullScreenMapOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_filteredUsers, setFilteredUsers] = useState<UserWithLocation[]>([]);

  // Stabiliser la fonction callback
  const handleUsersFiltered = useCallback((users: UserWithLocation[]) => {
    setFilteredUsers(users);
  }, []);

  const missionLocation = useMemo(
    () => ({
      lat: data?.missionLocation?.lat || 0,
      lon: data?.missionLocation?.lon || 0
    }),
    [data?.missionLocation?.lat, data?.missionLocation?.lon]
  );

  // Stabiliser center
  const center = useMemo(
    (): LatLngExpression => [
      data?.missionLocation?.lat || 0,
      data?.missionLocation?.lon || 0
    ],
    [data?.missionLocation?.lat, data?.missionLocation?.lon]
  );
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader
          size="xl"
          text="Chargement des détails de la mission"
          variant="dots"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-red-500">
          Erreur lors du chargement des détails de la mission: {error.message}
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-red-500">
          Aucune donnée trouvée pour cette mission.
        </p>
      </div>
    );
  }

  const createTeamGestionnaryItems = () => {
    if (!data) return [];

    const items: Array<{
      job: EnumMissionJob;
      employee?: (typeof data.employees)[0];
      isOccupied: boolean;
    }> = [];

    // Pour chaque type de poste requis
    data.requiredPositions.forEach((position) => {
      // Créer autant d'items que de quantity
      for (let i = 0; i < position.quantity; i++) {
        // Chercher un employé correspondant qui n'est pas encore assigné
        const assignedEmployee = data.employees.find(
          (emp) =>
            emp.missionJob === position.jobType &&
            emp.status === "accepted" &&
            !items.some((item) => item.employee?.id === emp.id)
        );

        items.push({
          job: position.jobType as EnumMissionJob,
          employee: assignedEmployee,
          isOccupied: !!assignedEmployee
        });
      }
    });

    return items;
  };

  const teamItems = createTeamGestionnaryItems();
  const items: DetailListItem[] = [
    {
      label: "Nom de la mission",
      value: data.name
    },
    {
      label: "Lieu de la mission",
      value: data.missionLocation?.fullName || "Aucun lieu spécifié"
    },
    {
      label: "Date de début",
      value: formatDateTimeLocal(data.missionStartDate)
    },
    {
      label: "Date de fin",
      value: formatDateTimeLocal(data.missionEndDate)
    }
  ];

  const points: MissionPoint[] = [
    {
      id: data.missionLocation?.fullName || "unknown-location",
      position: center,
      label: data.missionLocation?.fullName || "Lieu inconnu",
      variant: "mission"
    }
  ];

  return (
    <div className="relative flex h-auto flex-col lg:h-full">
      <h1 className="text-center text-2xl font-bold text-employer-secondary">
        Détails de la mission {data.name}
      </h1>
      <div className="grid flex-1 gap-3 overflow-hidden py-4 lg:grid lg:grid-cols-3 lg:gap-x-4">
        <div className="flex w-full flex-1 flex-col gap-4 overflow-auto rounded-lg bg-employer-background shadow-md">
          <div className="flex flex-1 flex-col p-4">
            <h2 className="text-lg font-bold text-employer-primary">
              Détails de la mission
            </h2>
            <DetailsList items={items} />
            <div className="flex flex-1 flex-col">
              <MapContainerComponent
                center={center}
                points={points}
                height="100%"
              />
              <span className="text-lg font-bold italic text-employer-primary">
                {data.missionLocation?.fullName}
              </span>
            </div>
            <Button
              theme="company"
              fullWidth
              className="h-full max-h-24 font-bold lg:hidden"
              onClick={() => setFullScreenMapOpen(true)}
            >
              Voir les extras disponibles sur la carte
            </Button>
          </div>
        </div>
        <div className="flex flex-1 flex-col items-center justify-between gap-5 rounded-lg bg-employer-background p-4 shadow-md">
          <Card className="h-full w-full">
            <CardTitle className="text-lg font-bold text-employer-primary">
              Description de la mission
            </CardTitle>
            <CardContent className="overflow-y-auto">
              {data.description || "Aucune description fournie."}
            </CardContent>
          </Card>
          <Card className="h-full w-full">
            <CardTitle className="text-lg font-bold text-employer-primary">
              Information destinées aux extras
            </CardTitle>
            <CardContent className="overflow-y-auto">
              {data.additionalInfo || "Aucune description fournie."}
            </CardContent>
          </Card>
          <Dialog open={fullScreenMapOpen} onOpenChange={setFullScreenMapOpen}>
            <DialogTrigger asChild>
              <Button
                theme="company"
                fullWidth
                className="hidden h-full max-h-24 font-bold lg:block"
              >
                Voir les extras disponibles sur la carte
              </Button>
            </DialogTrigger>
            <DialogContent
              className="flex h-[90vh] w-[90vw] flex-col"
              forceFullWidth
              aria-describedby="dialog-description"
            >
              <DialogTitle>Carte de recherche d'extra</DialogTitle>
              <DialogDescription id="dialog-description">
                Utilisez la carte pour rechercher et filtrer les extras
                disponibles autour du lieu de la mission.
              </DialogDescription>
              <MapWithUserFilter
                center={center}
                missionLocation={missionLocation}
                onUsersFiltered={handleUsersFiltered}
                showInfo={true}
                autoFetch={true}
                initialRadius={2.5}
                preservePrivacy={true}
              />
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex w-full flex-1 flex-col gap-5 overflow-auto">
          <div className="flex items-center gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button theme="company" className="font-bold" fullWidth>
                  Vos besoins
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogDescription>Récapitulatif</DialogDescription>
                <DialogTitle>
                  Vos besoins en équipe pour cette mission
                </DialogTitle>
                <p>Vous avez indiqué que vous avez besoin de:</p>
                <ul className="list-disc pl-5">
                  {data.requiredPositions.map((position) => (
                    <li key={position.jobType}>
                      {capitalizeFirstLetter(
                        getJobLabel(
                          position.jobType.toUpperCase() as EnumMissionJob
                        )
                      )}{" "}
                      - {position.quantity} poste(s)
                    </li>
                  ))}
                </ul>
                <p className="mt-2">
                  Vous pouvez modifier ces besoins en éditant la mission
                </p>
              </DialogContent>
            </Dialog>
            <PendingInvitations missionId={id} />
          </div>
          <div className="flex flex-1 flex-col gap-1 rounded-lg bg-employer-background p-1 shadow-md sm:p-3">
            {teamItems.map((item, index) => {
              return (
                <TeamGestionnaryItem
                  key={`${item.job}-${index}`}
                  tipNumber={index + 1}
                  value={
                    item.employee
                      ? `${capitalizeFirstLetter(getJobLabel(item.job.toUpperCase() as EnumMissionJob))} - ${item.employee.user.extra.firstName} ${item.employee.user.extra.lastName}`
                      : `Place de ${capitalizeFirstLetter(getJobLabel(item.job.toUpperCase() as EnumMissionJob))} disponible`
                  }
                  isOccupied={item.isOccupied}
                  modalInfo={
                    item.isOccupied && item.employee
                      ? {
                          title: "Informations sur l'extra",
                          content: (
                            <div>
                              <p>
                                Nom: {item.employee.user.extra.firstName}{" "}
                                {item.employee.user.extra.lastName}
                              </p>
                              <p>
                                Poste:{" "}
                                {getJobLabel(
                                  item.job.toUpperCase() as EnumMissionJob
                                )}
                              </p>
                              <p>Date de début: {item.employee.startDate}</p>
                              <p>
                                Durée: {formatDuration(item.employee.duration)}
                              </p>
                            </div>
                          )
                        }
                      : undefined
                  }
                  missionJob={item.job.toUpperCase() as EnumMissionJob}
                  maxDateEnd={data.missionEndDate}
                  minDateStart={data.missionStartDate}
                  missionId={id}
                  userId={item.employee?.user.id}
                  onDeleteFetch={refetch}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
