"use client";

import { MissionPoint } from "@/components/MapContainerComponent/DynamicMapContent";
import MapContainerComponent from "@/components/MapContainerComponent/MapContainerComponent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  DetailListItem,
  DetailsList
} from "@/components/ui/DetailsList/DetailsList";
import { Loader } from "@/components/ui/Loader/Loader";
import { TeamGestionnaryItem } from "@/components/ui/TeamGestionnaryItem/TeamGestionnaryItem";
import useFetch from "@/hooks/useFetch";
import { EnumMissionJob } from "@/store/types";
import { MissionDetailApiResponse } from "@/types/api";
import { formatDateTimeLocal } from "@/utils/date";
import { LatLngExpression } from "leaflet";
import { useParams } from "next/navigation";

export default function MissionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, error, loading } = useFetch<MissionDetailApiResponse>(
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
        Détails de la mission {id}
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
        <div className="flex h-full w-full flex-col gap-5">
          <Button theme="company" className="font-bold" fullWidth>
            Vos besoins
          </Button>
          <div className="flex flex-col gap-1 rounded-lg bg-employer-background p-4 shadow-md">
            <TeamGestionnaryItem
              job={EnumMissionJob.WAITER}
              onDelete={() => {}}
              onInvite={() => {}}
              tipNumber={1}
            />
            <TeamGestionnaryItem
              job={EnumMissionJob.WAITER}
              onDelete={() => {}}
              onInvite={() => {}}
              tipNumber={1}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
