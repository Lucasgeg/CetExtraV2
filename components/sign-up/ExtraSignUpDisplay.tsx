import { useSignUpStore } from "@/store/store";
import { MissionJob } from "@prisma/client";
import { useState } from "react";
import AddressAutocomplete from "../ui/atom/AutocompleteAdressSearch/AutocompleteAdressSearch";
import { DatePickerInput } from "../ui/atom/DatePickerInput/DatePickerInput";
import { LabelledInput } from "../ui/atom/LabelledInput";
import {
  Items,
  LabelledSelect,
} from "../ui/atom/LabelledSelect/LabelledSelect";
import { RadioGroup } from "../ui/RadioGroup";
import { ExtraErrorMessages } from "@/app/(public)/sign-up/[[...sign-up]]/page";

type ExtraSignUpDisplayProps = {
  errors?: ExtraErrorMessages;
};

export const ExtraSignUpDisplay = ({ errors }: ExtraSignUpDisplayProps) => {
  const { user, updateExtraProperty } = useSignUpStore();

  const [selectedMissionJob, setSelectedMissionJob] = useState<MissionJob>(
    MissionJob.waiter
  );
  const [selectedMaxTravelDistance, setSelectedMaxTravelDistance] = useState<
    number | undefined
  >(undefined);

  const handleMissionJobChange = (value: string) => {
    const missionJob = value as MissionJob;
    setSelectedMissionJob(missionJob);
    updateExtraProperty("missionJob", missionJob);
  };

  const handleMaxTravelDistanceChange = (value: string) => {
    setSelectedMaxTravelDistance(Number(value));
    if (selectedMaxTravelDistance)
      updateExtraProperty("max_travel_distance", selectedMaxTravelDistance);
  };

  const missionJobOptions = [
    {
      value: MissionJob.waiter,
      label: "Serveur",
      description: "Travail en salle",
    },
    {
      value: MissionJob.cook,
      label: "Cuisinier",
      description: "Travail en cuisine",
    },
    {
      value: MissionJob.both,
      label: "Les deux",
      description: "Travail en cuisine et en salle",
    },
  ];

  const maxRangeOptions: Items[] = [
    { value: "5", label: "5 km" },
    { value: "10", label: "10 km" },
    { value: "15", label: "15 km" },
    { value: "20", label: "20 km" },
    { value: "25", label: "25 km" },
    { value: "30", label: "30 km" },
  ];
  return (
    <>
      <div className="flex flex-col lg:flex-row items-center">
        <span className="lg:w-1/3">Tu recherche un poste de:</span>
        <RadioGroup
          name="missionJob"
          options={missionJobOptions}
          selectedValue={selectedMissionJob}
          onChange={handleMissionJobChange}
        />
      </div>

      <LabelledInput
        label="Ton nom"
        onChange={(e) => updateExtraProperty("last_name", e.target.value)}
        value={user?.extra?.last_name || ""}
        errorMessage={errors?.lastName}
      />
      <LabelledInput
        label="Ton prénom"
        onChange={(e) => updateExtraProperty("first_name", e.target.value)}
        value={user?.extra?.first_name || ""}
        errorMessage={errors?.firstName}
      />
      <AddressAutocomplete />
      <DatePickerInput
        onSelectedDateAction={(e) => updateExtraProperty("birthdate", e)}
        label="Date de naissance"
        value={user?.extra?.birthdate}
        errorMessage={errors?.birthDate}
      />
      <LabelledSelect
        items={maxRangeOptions}
        label="Distance maximale des missions"
        onValueChange={handleMaxTravelDistanceChange}
        defaultValue={maxRangeOptions[0].value}
      />
      <LabelledInput
        label="Ton numéro de téléphone"
        onChange={(e) => updateExtraProperty("phone", e.target.value)}
        value={user?.extra?.phone || ""}
      />
    </>
  );
};
