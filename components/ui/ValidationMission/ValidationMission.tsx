"use client";
import { type LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import MapContainerComponent, {
  MissionPoint
} from "../../MapContainerComponent/MapContainerComponent";
import { CreateMissionFormValues } from "@/types/api";
import { DetailListItem, DetailsList } from "../DetailsList/DetailsList";
import { EnumMissionJob } from "@/store/types";
import { Card, CardContent, CardTitle } from "../card";
import { Button } from "../button";

type ValidationMissionProps = {
  formData: CreateMissionFormValues;
  onCancel: () => void;
  isSubmitting: boolean;
};

export default function ValidationMission({
  formData,
  onCancel,
  isSubmitting
}: ValidationMissionProps) {
  const center: LatLngExpression = [
    formData.location.lat,
    formData.location.lon
  ];

  const getTimes = (date: string) => {
    const d = new Date(date);
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const points: MissionPoint[] = [
    {
      id: formData.location.place_id.toString(),
      position: center,
      label: formData.location.display_name,
      variant: "mission"
    }
  ];

  const listItems: DetailListItem[] = [
    {
      label: "Nom de la mission",
      value: formData.missionName
    },
    {
      label: "Lieu de la mission",
      value: formData.location.display_name
    },
    {
      label: "Date de début",
      value:
        new Date(formData.missionStartDate).toLocaleDateString("fr-FR") +
        ` à ${getTimes(formData.missionStartDate)}`
    },
    {
      label: "Date de fin",
      value:
        new Date(formData.missionEndDate).toLocaleDateString("fr-FR") +
        ` à ${getTimes(formData.missionEndDate)}`
    }
  ];

  const getJobLabel = (jobKey: string): string => {
    return EnumMissionJob[jobKey as keyof typeof EnumMissionJob] || jobKey;
  };

  const requiredPositions = Object.entries(formData.teamCounts)
    .filter(([, quantity]) => !!quantity && quantity > 0)
    .map(([job, quantity]) => ({
      label: quantity > 1 ? `${getJobLabel(job)}s` : getJobLabel(job),
      value: quantity.toString()
    }));

  return (
    <>
      <div className="grid h-full grid-cols-1 gap-x-4 gap-y-2 p-4 lg:grid-cols-3">
        <div className="flex h-full flex-col overflow-y-auto rounded-lg bg-employer-background p-4 shadow-md">
          <h2 className="text-lg font-bold text-employer-primary">
            Détails de la mission
          </h2>
          <DetailsList items={listItems} />
          <h2 className="text-lg font-bold text-employer-primary">
            Vos besoins:
          </h2>
          <DetailsList items={requiredPositions} />
        </div>
        <div className="flex h-full flex-col items-center justify-between gap-5 rounded-lg bg-employer-background p-4 shadow-md">
          <Card className="h-full w-full">
            <CardTitle className="text-lg font-bold text-employer-primary">
              Description de la mission
            </CardTitle>
            <CardContent className="overflow-y-auto">
              {formData?.missionDescription || "Aucune description fournie."}
            </CardContent>
          </Card>
          <Card className="h-full w-full">
            <CardTitle className="text-lg font-bold text-employer-primary">
              Information destinées aux extras
            </CardTitle>
            <CardContent className="overflow-y-auto">
              {formData?.additionalInfo || "Aucune description fournie."}
            </CardContent>
          </Card>
        </div>
        <div className="flex h-full flex-col items-center justify-center overflow-auto rounded-lg bg-employer-background p-4 shadow-md">
          <MapContainerComponent
            center={center}
            points={points}
            height="100%"
          />

          <span className="text-lg font-bold italic text-employer-primary">
            {formData.location?.display_name}
          </span>
          <div className="mt-2 flex w-full justify-end gap-6">
            <Button
              type="button"
              theme="company"
              className="font-bold"
              size="lg"
              onClick={onCancel}
              disabled={isSubmitting}
              variant={"outline"}
            >
              Annuler
            </Button>
            <Button
              theme="company"
              className="font-bold"
              variant={"destructive"}
              size="lg"
              autoFocus
              type="submit"
              disabled={isSubmitting}
            >
              Valider
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
