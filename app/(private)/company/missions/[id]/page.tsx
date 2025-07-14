"use client";

import { MissionPoint } from "@/components/MapContainerComponent/DynamicMapContent";
import MapContainerComponent from "@/components/MapContainerComponent/MapContainerComponent";
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
  DialogTrigger
} from "@/components/ui/dialog";
import { Loader } from "@/components/ui/Loader/Loader";
import { TeamGestionnaryItem } from "@/components/ui/TeamGestionnaryItem/TeamGestionnaryItem";
import useFetch from "@/hooks/useFetch";
import { EnumMissionJob } from "@/store/types";
import { MissionDetailApiResponse } from "@/types/api";
import { formatDateTimeLocal } from "@/utils/date";
import { getJobLabel } from "@/utils/enum";
import { capitalizeFirstLetter } from "@/utils/string";
import { Dialog } from "@radix-ui/react-dialog";
import { LatLngExpression } from "leaflet";
import { useParams } from "next/navigation";

export default function MissionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, error, loading, refetch } = useFetch<MissionDetailApiResponse>(
    `/api/mission/${id}`
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
      value: formatDateTimeLocal(data.mission_start_date)
    },
    {
      label: "Date de fin",
      value: formatDateTimeLocal(data.mission_end_date)
    }
  ];

  const center: LatLngExpression = [
    data.missionLocation?.lat || 0,
    data.missionLocation?.lon || 0
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
    <div className="relative h-auto pb-6 lg:h-full">
      <h1 className="text-center text-2xl font-bold text-employer-secondary">
        Détails de la mission {data.name}
      </h1>
      <div className="grid h-full gap-3 py-4 lg:grid lg:grid-cols-3 lg:gap-x-4">
        <div className="flex h-full w-full flex-col gap-4 overflow-auto rounded-lg bg-employer-background p-4 shadow-md">
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
          >
            Voir les extras disponibles sur la carte
          </Button>
        </div>
        <div className="flex flex-col items-center justify-between gap-5 rounded-lg bg-employer-background p-4 shadow-md">
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
          <Button
            theme="company"
            fullWidth
            className="hidden h-full max-h-24 font-bold lg:block"
          >
            Voir les extras disponibles sur la carte
          </Button>
        </div>
        <div className="flex h-full w-full flex-col gap-5 overflow-auto">
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
          <div className="flex flex-1 flex-col gap-1 overflow-auto rounded-lg bg-employer-background p-4 shadow-md">
            {teamItems.map((item, index) => {
              return (
                <TeamGestionnaryItem
                  key={`${item.job}-${index}`}
                  tipNumber={index + 1}
                  value={
                    item.employee
                      ? `${capitalizeFirstLetter(getJobLabel(item.job.toUpperCase() as EnumMissionJob))} - ${item.employee.user.extra.first_name} ${item.employee.user.extra.last_name}`
                      : `Place de ${capitalizeFirstLetter(getJobLabel(item.job.toUpperCase() as EnumMissionJob))} disponible`
                  }
                  isOccupied={item.isOccupied}
                  modalInfo={
                    item.isOccupied
                      ? {
                          title: "Informations sur l'extra",
                          content: (
                            <div>
                              <p>
                                Nom: {item.employee?.user.extra.first_name}{" "}
                                {item.employee?.user.extra.last_name}
                              </p>
                              <p>
                                Poste:{" "}
                                {getJobLabel(
                                  item.job.toUpperCase() as EnumMissionJob
                                )}
                              </p>
                              <p>Date de début: {item.employee?.start_date}</p>
                              <p>Durée: {item.employee?.duration} heures</p>
                            </div>
                          )
                        }
                      : undefined
                  }
                  missionJob={item.job.toUpperCase() as EnumMissionJob}
                  maxDateEnd={data.mission_end_date}
                  minDateSart={data.mission_start_date}
                  missionId={id}
                  userId={item.employee?.userId}
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
