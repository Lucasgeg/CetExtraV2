"use client";
import { useState } from "react";
import { useSignUpStore } from "@/store/store";
import { MissionJob, Role } from "@prisma/client";
import { RadioGroup } from "../ui/RadioGroup";
import { LabelledInput } from "../ui/atom/LabelledInput";
import AddressAutocomplete from "../ui/atom/AutocompleteAdressSearch/AutocompleteAdressSearch";
import { DatePickerInput } from "../ui/atom/DatePickerInput/DatePickerInput";
import {
  Items,
  LabelledSelect,
} from "../ui/atom/LabelledSelect/LabelledSelect";

type MoreInformationDisplayProps = {
  handleSubmit: (e: React.FormEvent) => void;
};

export const MoreInformationDisplay = ({
  handleSubmit,
}: MoreInformationDisplayProps) => {
  const { user, updateUserProperty } = useSignUpStore();
  const [selectedRole, setSelectedRole] = useState<Role>(Role.extra);
  const [selectedMissionJob, setSelectedMissionJob] = useState<MissionJob>(
    MissionJob.waiter
  );
  const [selectedMaxTravelDistance, setSelectedMaxTravelDistance] = useState<
    number | undefined
  >(undefined);

  const handleRoleChange = (value: string) => {
    const role = value as Role;
    setSelectedRole(role);
    updateUserProperty("role", role);
  };

  const handleMissionJobChange = (value: string) => {
    const missionJob = value as MissionJob;
    setSelectedMissionJob(missionJob);
    updateUserProperty("missionJob", missionJob);
  };

  const handleMaxTravelDistanceChange = (value: string) => {
    setSelectedMaxTravelDistance(Number(value));
    if (selectedMaxTravelDistance)
      updateUserProperty("max_travel_distance", selectedMaxTravelDistance);
  };

  const roleOptions = [
    {
      value: Role.extra,
      label: "Extra",
      description: "Une personne à la recherche de missions ponctuelles",
    },
    {
      value: Role.company,
      label: "Employeur",
      description: "Une entreprise à la recherche de candidats",
    },
  ];

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
      <h2 className="text-xl">
        Nous avons besoin de quelques informations supplémentaire pour valider
        ton compte:
      </h2>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="md:grid md:grid-cols-2 flex flex-col gap-3">
          <div className="flex flex-col md:flex-row items-center ">
            <span>Tu es un:</span>
            <RadioGroup
              name="role"
              options={roleOptions}
              selectedValue={selectedRole}
              onChange={handleRoleChange}
            />
          </div>
          {selectedRole === Role.extra && (
            <div className="flex flex-col md:flex-row items-center">
              <span className="md:w-1/3">Tu recherche un poste de:</span>
              <RadioGroup
                name="missionJob"
                options={missionJobOptions}
                selectedValue={selectedMissionJob}
                onChange={handleMissionJobChange}
              />
            </div>
          )}
          <LabelledInput
            label="Ton nom"
            onChange={(e) => updateUserProperty("last_name", e.target.value)}
            value={user?.last_name || ""}
          />
          <LabelledInput
            label="Ton prénom"
            onChange={(e) => updateUserProperty("first_name", e.target.value)}
            value={user?.first_name || ""}
          />
          <AddressAutocomplete />
          <DatePickerInput
            onSelectedDate={(e) => updateUserProperty("birthdate", e)}
            label="Date de naissance"
          />
          <LabelledSelect
            items={maxRangeOptions}
            label="Distance maximale des missions"
            onValueChange={handleMaxTravelDistanceChange}
            defaultValue={maxRangeOptions[0].value}
          />
          <LabelledInput
            label="Ton numéro de téléphone"
            onChange={(e) => updateUserProperty("phone", e.target.value)}
            value={user?.phone || ""}
          />
        </div>
        <button
          type="submit"
          className="border rounded-lg bg-blue-500 text-white py-2 px-4 my-4 hover:bg-blue-600"
        >
          Valider
        </button>
      </form>
    </>
  );
};
