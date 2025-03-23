import { useSignUpStore } from "@/store/store";
import { useState } from "react";
import { DatePickerInput } from "../ui/atom/DatePickerInput/DatePickerInput";
import { LabelledInput } from "../ui/atom/LabelledInput";
import {
  Items,
  LabelledSelect,
} from "../ui/atom/LabelledSelect/LabelledSelect";
import { RadioGroup } from "../ui/RadioGroup";
import { AddressAutocomplete } from "../ui/atom/AutocompleteAdressSearch/AutocompleteAdressSearch";
import { Extra, ExtraErrorMessages, MissionJob } from "@/store/types";

export const ExtraSignUpDisplay = ({
  errorMessages,
}: {
  errorMessages?: ExtraErrorMessages;
}) => {
  const { extra, updateExtraProperty, setErrorMessages } = useSignUpStore();

  const [selectedMissionJob, setSelectedMissionJob] = useState<MissionJob>(
    MissionJob.WAITER
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
      value: MissionJob.WAITER,
      label: "Serveur",
      description: "Travail en salle",
    },
    {
      value: MissionJob.COOK,
      label: "Cuisinier",
      description: "Travail en cuisine",
    },
    {
      value: MissionJob.BOTH,
      label: "Les deux",
      description: "Travail en cuisine et en salle",
    },
  ];

  const handleChange = (
    key: keyof Omit<Extra, "id">,
    value?: string | Date
  ) => {
    if (errorMessages) {
      setErrorMessages({});
    }
    updateExtraProperty(key, value);
  };

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
        onChange={(e) => handleChange("last_name", e.target.value)}
        value={extra?.last_name || ""}
        errorMessage={errorMessages?.lastName}
      />
      <LabelledInput
        label="Ton prénom"
        onChange={(e) => handleChange("first_name", e.target.value)}
        value={extra?.first_name || ""}
        errorMessage={errorMessages?.firstName}
      />
      <AddressAutocomplete errorMessage={errorMessages?.location} />
      <DatePickerInput
        onSelectedDateAction={(e) => handleChange("birthdate", e)}
        label="Date de naissance"
        value={extra?.birthdate}
        errorMessage={errorMessages?.birthDate}
      />
      <LabelledSelect
        items={maxRangeOptions}
        label="Distance maximale des missions"
        onValueChange={handleMaxTravelDistanceChange}
        defaultValue={maxRangeOptions[0].value}
      />
      <LabelledInput
        label="Ton numéro de téléphone"
        onChange={(e) => handleChange("phone", e.target.value)}
        value={extra?.phone || ""}
      />
    </>
  );
};
